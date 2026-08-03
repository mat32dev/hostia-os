{
  "event_type": "cross_agent_notification",
  "from_agent": "pos_agent",
  "to_agent": "guard_agent",
  "priority": "high",
  "payload": {
    "type": "expected_cash_transaction",
    "transaction_id": "TXN-2847",
    "amount": 18.50,
    "currency": "EUR",
    "timestamp": "2026-08-03T21:34:00Z",
    "table": 4,
    "staff": "carlos_001",
    "payment_method": "cash",
    "verification_window": {
      "start": "2026-08-03T21:32:00Z",
      "end": "2026-08-03T21:40:00Z"
    }
  },
  "context": {
    "conversation_id": "conv_abc123",
    "customer_phone": "+34612345678"
  }
}
