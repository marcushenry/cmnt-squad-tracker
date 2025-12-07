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

variable "bucket_name" {
  type    = string
  default = "cmnt-squad-tracker-goose"  # change this to something globally unique
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
