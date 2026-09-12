#!/bin/sh

set -eu

: "${MINIO_ROOT_USER:?MINIO_ROOT_USER is required}"
: "${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}"
: "${MINIO_APP_ACCESS_KEY:?MINIO_APP_ACCESS_KEY is required}"
: "${MINIO_APP_SECRET_KEY:?MINIO_APP_SECRET_KEY is required}"
: "${MINIO_BUCKET:?MINIO_BUCKET is required}"

echo "Waiting for MinIO..."

until mc alias set \
  local \
  http://minio:9000 \
  "$MINIO_ROOT_USER" \
  "$MINIO_ROOT_PASSWORD"
do
  sleep 2
done

echo "Creating bucket..."

mc mb \
  --ignore-existing \
  "local/$MINIO_BUCKET"


echo "Creating backend policy..."

cat > /tmp/altioria-app-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::$MINIO_BUCKET"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::$MINIO_BUCKET/*"
      ]
    }
  ]
}
EOF


echo "Creating/updating application user..."

mc admin user add \
  local \
  "$MINIO_APP_ACCESS_KEY" \
  "$MINIO_APP_SECRET_KEY"

mc admin policy create \
  local \
  altioria-app \
  /tmp/altioria-app-policy.json

mc admin policy attach \
  local \
  altioria-app \
  --user "$MINIO_APP_ACCESS_KEY"


echo "Configuring public read-only policy..."

cat > /tmp/altioria-public-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::$MINIO_BUCKET/categories/*",
        "arn:aws:s3:::$MINIO_BUCKET/products/*"
      ]
    }
  ]
}
EOF

mc anonymous set-json \
  /tmp/altioria-public-policy.json \
  "local/$MINIO_BUCKET"


echo "Uploading default category images..."

for file in /initial-images/categories/*.webp
do
  [ -f "$file" ] || continue

  filename=$(basename "$file")

  target="local/$MINIO_BUCKET/categories/default/$filename"

  if mc stat "$target" >/dev/null 2>&1
  then
    echo "Already exists: $target"
  else
    mc cp "$file" "$target"

    echo "Uploaded: $target"
  fi
done


echo "Uploading product catalog media..."

if [ -d /initial-images/products ]
then
  mc mirror \
    --overwrite \
    /initial-images/products \
    "local/$MINIO_BUCKET/products"
fi


echo "MinIO initialization completed"
