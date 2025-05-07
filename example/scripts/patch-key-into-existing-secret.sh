#!/bin/bash

NAMESPACE="<your namespace>"
SECRET_NAME="airflow-db-creds"
CONNECTION_KEY="connection"
USERNAME="airflow"
PASSWORD="airflow"
HOST="airflow-postgresql"
PORT="5432"
DATABASE="airflow"

# Final connection string
CONN_STRING="postgresql+psycopg2://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}"

# Check if secret exists
kubectl get secret $SECRET_NAME -n $NAMESPACE >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Error: Secret '$SECRET_NAME' not found in namespace '$NAMESPACE'"
  exit 1
fi

# Check if the 'connection' key already exists
EXISTS=$(kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath="{.data.$CONNECTION_KEY}")

if [ -n "$EXISTS" ]; then
  echo "The Secret already contains key '$CONNECTION_KEY'. No action needed."
else
  echo "Update: Adding '$CONNECTION_KEY' to secret '$SECRET_NAME'..."
  ENCODED=$(echo -n "$CONN_STRING" | base64)

  kubectl patch secret $SECRET_NAME -n $NAMESPACE \
    --type=json \
    -p="[{
      \"op\": \"add\",
      \"path\": \"/data/$CONNECTION_KEY\",
      \"value\": \"$ENCODED\"
    }]"
  
  if [ $? -eq 0 ]; then
    echo "Successfully added connection string to secret."
  else
    echo "Failed to patch the secret."
    exit 1
  fi
fi
