#!/bin/bash
# SSL Setup with Let's Encrypt – srv1587098.hstgr.cloud
set -euo pipefail

EMAIL="${1:-admin@srv1587098.hstgr.cloud}"
DOMAINS=(
  "srv1587098.hstgr.cloud"
  "api.srv1587098.hstgr.cloud"
)

echo "Obtaining SSL certificates for: ${DOMAINS[*]}"

for domain in "${DOMAINS[@]}"; do
  certbot --nginx \
    -d "$domain" \
    --non-interactive \
    --agree-tos \
    -m "$EMAIL" \
    --redirect

  echo "✓ SSL certificate obtained for $domain"
done

# Auto-renew cron
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

echo "✓ Auto-renew cron set"
echo "✓ All SSL certificates installed"
