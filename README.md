Mailpy - EPICS PV Monitoring Systems
====================================

Central repository

Deploy
------
```command
UID=$UID GID=$GID docker-compose up --force-recreate
```

Secrets
-------
Creating secrets:

```bash
echo "..........." | docker secret create ALERT_MAIL_LOGIN -
echo "..........." | docker secret create ALERT_MAIL_PASSWORD -
```
