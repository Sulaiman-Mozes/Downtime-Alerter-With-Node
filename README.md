Generate SSL certificate

openssl req -x509 -newkey rsa:4096 -days 365 -keyout key.pem -out cert.pem -nodes

Generate Keys

openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
