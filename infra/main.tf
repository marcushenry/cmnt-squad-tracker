terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

############################################
# Shared data sources (ACM cert + hosted zone)
############################################

# Use your new ACM cert that includes:
# marcushenry.ca, *.marcushenry.ca, cmnt-dev.marcushenry.ca, cmnt.marcushenry.ca
data "aws_acm_certificate" "marcushenry" {
  domain      = "marcushenry.ca"
  statuses    = ["ISSUED"]
  most_recent = true
}

# Public hosted zone for marcushenry.ca
data "aws_route53_zone" "marcushenry" {
  name         = "marcushenry.ca."
  private_zone = false
}

############################################
# CloudFront distribution for DEV
#  - Origin: dev S3 website endpoint
#  - Domain: cmnt-dev.marcushenry.ca
############################################

resource "aws_cloudfront_distribution" "cmnt_dev" {
  enabled             = true
  default_root_object = "index.html"

  # Custom domain for this distribution
  aliases = [
    "cmnt-dev.marcushenry.ca",
  ]

  # Origin: S3 *website* endpoint for your DEV bucket
  origin {
    domain_name = aws_s3_bucket_website_configuration.site_dev.website_endpoint
    origin_id   = "cmnt-dev-s3-website-origin"

    # Because this is a website endpoint, it must be a "custom origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "cmnt-dev-s3-website-origin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    compress = true

    # Simple legacy-style forwarding (no query strings or cookies)
    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  price_class = "PriceClass_100" # NA + EU, keeps cost down

  viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.marcushenry.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

############################################
# Route 53 record for cmnt-dev.marcushenry.ca
############################################

resource "aws_route53_record" "cmnt_dev" {
  zone_id = data.aws_route53_zone.marcushenry.zone_id
  name    = "cmnt-dev"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cmnt_dev.domain_name
    zone_id                = aws_cloudfront_distribution.cmnt_dev.hosted_zone_id
    evaluate_target_health = false
  }
}

############################################
# CloudFront distribution for PROD
#  - Origin: prod S3 website endpoint
#  - Domain: cmnt.marcushenry.ca
############################################

resource "aws_cloudfront_distribution" "cmnt_prod" {
  enabled             = true
  default_root_object = "index.html"

  aliases = [
    "cmnt.marcushenry.ca",
  ]

  origin {
    # PROD S3 website endpoint
    domain_name = aws_s3_bucket_website_configuration.site.website_endpoint
    origin_id   = "cmnt-prod-s3-website-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "cmnt-prod-s3-website-origin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    compress = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  price_class = "PriceClass_100"

  viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.marcushenry.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

############################################
# Route 53 record for cmnt.marcushenry.ca → CloudFront PROD
############################################

resource "aws_route53_record" "cmnt_prod" {
  zone_id = data.aws_route53_zone.marcushenry.zone_id
  name    = "cmnt"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cmnt_prod.domain_name
    zone_id                = aws_cloudfront_distribution.cmnt_prod.hosted_zone_id
    evaluate_target_health = false
  }
}



variable "bucket_name" {
  type    = string
  default = "cmnt-squad-tracker-goose"
}

variable "dev_bucket_name" {
  type    = string
  default = "cmnt-squad-tracker-goose-dev"
}

resource "aws_s3_bucket" "site" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "site_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.site]

  bucket = aws_s3_bucket.site.id
  acl    = "public-read"
}


resource "aws_s3_bucket_policy" "site_public_policy" {
  bucket = aws_s3_bucket.site.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.site.arn}/*"
      }
    ]
  })
}

output "website_url" {
  value       = aws_s3_bucket_website_configuration.site.website_endpoint
  description = "Public URL for the static website"
}

# -------------------
# DEV BUCKET
# -------------------

resource "aws_s3_bucket" "site_dev" {
  bucket = var.dev_bucket_name
}

resource "aws_s3_bucket_website_configuration" "site_dev" {
  bucket = aws_s3_bucket.site_dev.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_ownership_controls" "site_dev" {
  bucket = aws_s3_bucket.site_dev.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "site_dev_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.site_dev]

  bucket = aws_s3_bucket.site_dev.id
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "site_dev_public_policy" {
  bucket = aws_s3_bucket.site_dev.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.site_dev.arn}/*"
      }
    ]
  })
}

output "dev_website_url" {
  value       = aws_s3_bucket_website_configuration.site_dev.website_endpoint
  description = "Public URL for the **dev** static website"
}