# 🔐 AI-Powered Fraud Detection System

A production-style, event-driven fraud detection platform built using Java Spring Boot microservices, Apache Kafka, PostgreSQL, Redis, AWS-compatible services, and a Python-based AI reasoning service.

The system provides real-time payment processing, rule-based fraud detection, asynchronous fraud-alert notifications, audit logging, an API Gateway with resilience features, and a React-based fraud monitoring dashboard.

## ✨ Key Features

- 💳 Real-time payment processing
- 🛡️ Rule-based fraud risk scoring
- 🚨 Automatic fraud alert generation
- 📡 Event-driven communication using Apache Kafka
- 🔔 Asynchronous fraud notifications
- 🗄️ PostgreSQL for transactional data
- ⚡ Redis for caching
- ☁️ DynamoDB for notification storage
- 📦 Amazon S3 for fraud audit-log archival
- 🤖 Python FastAPI AI reasoning service
- 🧠 LangChain + LangGraph based AI analysis
- 🚪 Spring Cloud API Gateway
- 🔄 Circuit Breaker with Resilience4j
- 🌐 Centralized CORS configuration
- 📊 React + TypeScript + Vite fraud monitoring dashboard
- 📖 Swagger / OpenAPI documentation
- ❤️ Spring Boot Actuator health monitoring
- 🐳 Docker Compose based local infrastructure
- 🧪 End-to-end service integration testing

## 🏗️ System Architecture

```
                         ┌──────────────────────────┐
                         │     React Dashboard      │
                         │  TypeScript + Vite       │
                         │       Port 5173          │
                         └────────────┬─────────────┘
                                      │
                                      │ HTTP
                                      ▼
                         ┌──────────────────────────┐
                         │       API Gateway        │
                         │   Spring Cloud Gateway   │
                         │        Port 8080         │
                         │                          │
                         │  • Routing               │
                         │  • CORS                  │
                         │  • Circuit Breaker       │
                         │  • Fallback              │
                         └────────────┬─────────────┘
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
             ▼                        ▼                        ▼
   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
   │ Payment Service │      │ Fraud Detection │      │ Notification    │
   │    Port 8081    │      │    Port 8082    │      │    Port 8083    │
   └────────┬────────┘      └────────┬────────┘      └────────┬────────┘
            │                        │                        │
            ▼                        ▼                        ▼
      PostgreSQL                  Kafka                   DynamoDB
                                     │
                                     │ fraud-alerts
                                     ▼
                              Notification Service
                                     │
                                     ▼
                                    S3
                              Audit Log Storage


                         ┌──────────────────────────┐
                         │   AI Reasoning Service   │
                         │   FastAPI + LangChain    │
                         │   + LangGraph + OpenAI   │
                         │        Port 8084         │
                         └──────────────────────────┘


Infrastructure:
PostgreSQL • Redis • Kafka • Zookeeper • LocalStack • Kafka UI
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| API Gateway | Spring Cloud Gateway, Resilience4j |
| Backend | Java, Spring Boot, Spring Data JPA, Maven |
| Messaging | Apache Kafka, Zookeeper |
| Database | PostgreSQL 15 |
| Caching | Redis 7 |
| Notification Storage | AWS DynamoDB |
| Audit Storage | Amazon S3 |
| Local AWS Environment | LocalStack |
| AI Service | Python, FastAPI |
| AI / LLM | OpenAI GPT-4o, LangChain, LangGraph |
| API Documentation | SpringDoc OpenAPI / Swagger UI |
| Observability | Spring Boot Actuator, Micrometer |
| Infrastructure | Docker, Docker Compose |
| Testing | JUnit 5, Mockito, MockMvc, Testcontainers |

## 🚀 Services

### 1. API Gateway — Port 8080

The API Gateway acts as the single entry point for the frontend and external clients.

**Responsibilities**
- Routes requests to backend microservices
- Centralizes CORS configuration
- Provides fraud-service circuit breaker protection
- Provides fallback responses when the fraud service is unavailable
- Exposes Gateway route information through Actuator

**Routes**

```
/api/v1/payments/**       → Payment Service       :8081
/api/v1/fraud/**          → Fraud Detection       :8082
/api/v1/notifications/** → Notification Service   :8083
/api/v1/ai/**             → AI Reasoning Service   :8084
```

**Fraud Circuit Breaker**

The Fraud Detection Service is protected using a Spring Cloud Circuit Breaker with Resilience4j.

When the Fraud Detection Service becomes unavailable, the Gateway returns a 503 Service Unavailable response through the configured fallback endpoint.

Example:

```json
{
  "service": "fraud-detection-service",
  "status": "UNAVAILABLE",
  "message": "Fraud detection service is temporarily unavailable. Please try again later."
}
```

### 2. Payment Service — Port 8081

The Payment Service handles payment creation and payment lifecycle management.

**Responsibilities**
- Validate payment requests
- Persist payments in PostgreSQL
- Publish payment events to Kafka
- Maintain payment status
- Provide payment history APIs

**Endpoints**

```
POST   /api/v1/payments
GET    /api/v1/payments/{paymentId}
GET    /api/v1/payments/sender/{senderId}
PATCH  /api/v1/payments/{paymentId}/status
GET    /api/v1/payments/sender/{senderId}/failed-count
```

**Payment Request**

```json
{
  "senderId": "user-001",
  "receiverId": "merchant-001",
  "amount": 75000.00,
  "currency": "USD",
  "ipAddress": "45.33.32.156",
  "deviceId": "unknown-device"
}
```

**Payment Lifecycle**

```
Payment Created
      │
      ▼
   PENDING
      │
      ▼
 Fraud Analysis
      │
      ├──────────────► Safe
      │
      └──────────────► Suspicious
                              │
                              ▼
                           FLAGGED
```

### 3. Fraud Detection Service — Port 8082

The Fraud Detection Service consumes payment events from Kafka and evaluates transactions using a rule-based fraud detection engine.

**Responsibilities**
- Consume payment-events
- Calculate fraud risk score
- Identify suspicious transactions
- Persist fraud alerts in PostgreSQL
- Update payment status
- Publish fraud alerts to Kafka
- Provide fraud investigation APIs

**Risk Scoring Rules**

| Rule | Score |
|---|---|
| Amount ≥ $50,000 | +40 |
| Amount ≥ $10,000 | +20 |
| Suspicious IP | +30 |
| Unknown device | +20 |
| Same sender and receiver | +50 |

**Risk Levels**

| Level | Range |
|---|---|
| LOW | 0–19 |
| MEDIUM | 20–39 |
| HIGH | 40–69 |
| CRITICAL | 70+ |

**Example**

A transaction containing:

```
Amount:         $75,000
Suspicious IP:  Yes
Unknown Device: Yes
```

can produce:

```
Risk Score: 90
Risk Level: CRITICAL
```

**Endpoints**

```
GET /api/v1/fraud/alerts
GET /api/v1/fraud/alerts/payment/{paymentId}
GET /api/v1/fraud/alerts/risk/{riskLevel}
GET /api/v1/fraud/alerts/status/{status}
```

### 4. Notification Service — Port 8083

The Notification Service asynchronously consumes fraud alerts from Kafka.

**Responsibilities**
- Consume fraud-alerts
- Store notification records in DynamoDB
- Generate fraud notification records
- Archive fraud audit information to S3
- Provide notification APIs

**Endpoints**

```
GET /api/v1/notifications
GET /api/v1/notifications/payment/{paymentId}
```

**Notification Flow**

```
Fraud Detection Service
          │
          │ Kafka: fraud-alerts
          ▼
Notification Service
          │
          ├──────────────► DynamoDB
          │                fraud-notifications
          │
          └──────────────► S3
                           fraud-audit-logs
```

### 5. AI Reasoning Service — Port 8084

The AI Reasoning Service is a Python FastAPI application that provides AI-assisted fraud analysis using OpenAI GPT-4o, LangChain, and LangGraph.

**Responsibilities**
- Analyze suspicious payments
- Generate fraud explanations
- Provide AI-assisted decisions
- Perform multi-step agentic reasoning

**Simple Analysis**

```
POST /api/v1/ai/analyze
```

Uses a LangChain-based single LLM analysis.

**Agentic Analysis**

```
POST /api/v1/ai/analyze/agent
```

Uses LangGraph for stateful multi-step reasoning.

**Agent Flow**

```
             assess_risk
                  │
          ┌───────┴───────┐
          │               │
      score ≥ 70       score < 70
          │               │
          ▼               ▼
    deep_analysis   standard_analysis
          │               │
          └───────┬───────┘
                  ▼
               Decision
```

**Health Checks**

```
GET /health
GET /api/v1/ai/health
```

## 📊 Fraud Monitoring Dashboard

The project includes a dedicated React + TypeScript + Vite dashboard for monitoring and interacting with the fraud detection platform.

**Dashboard Features**
- 📊 Fraud analytics
- 🚨 Fraud alert monitoring
- 🔎 Fraud investigation
- 💳 Payment creation
- 💰 Payment information
- 🛡️ Risk score and risk-level visualization
- 🔄 Backend data refresh
- 🌐 API communication through the API Gateway

**Frontend Architecture**

```
                    React Dashboard
                           │
                           ▼
                    Service Layer
                           │
                           ▼
                     API Gateway
                        :8080
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       Payment Service          Fraud Detection
           :8081                    :8082
```

The dashboard communicates with the backend through the API Gateway rather than directly calling individual backend services.

**Dashboard API Configuration**

```
Fraud API:
http://localhost:8080/api/v1/fraud

Payment API:
http://localhost:8080/api/v1/payments
```

**Start Dashboard**

```bash
cd fraud-dashboard
npm install
npm run dev
```

Dashboard: http://localhost:5173

**Production Build**

```bash
cd fraud-dashboard
npm install
npm run build
```

Production files are generated inside: `fraud-dashboard/dist/`

## 🔄 Complete Event-Driven Flow

A high-risk payment flows through the system as follows:

```
                     React Dashboard
                            │
                            ▼
                      API Gateway
                         :8080
                            │
                            ▼
                    Payment Service
                         :8081
                            │
                            ├──────────────► PostgreSQL
                            │
                            │ payment-events
                            ▼
                          Kafka
                            │
                            ▼
                  Fraud Detection Service
                         :8082
                            │
                            ▼
                      Risk Analysis
                            │
                    ┌───────┴───────┐
                    │               │
                  SAFE            FRAUD
                    │               │
                    │               ▼
                    │         fraud-alerts
                    │               │
                    │               ▼
                    │             Kafka
                    │               │
                    │               ▼
                    │     Notification Service
                    │               │
                    │        ┌──────┴──────┐
                    │        ▼             ▼
                    │    DynamoDB          S3
                    │
                    ▼
               Payment Status
```

## 📡 Kafka Architecture

Kafka provides asynchronous communication between the microservices.

**Payment Events**

Topic: `payment-events`

Flow:

```
Payment Service
      │
      ▼
payment-events
      │
      ▼
Fraud Detection Service
```

**Fraud Alerts**

Topic: `fraud-alerts`

Flow:

```
Fraud Detection Service
      │
      ▼
fraud-alerts
      │
      ▼
Notification Service
```

## 🗄️ Data Storage

**PostgreSQL**

PostgreSQL is used for transactional application data.
- Payment records
- Fraud alerts
- Fraud analysis data

Port: `5432`

**Redis**

Redis is available as the caching layer.

Port: `6379`

**DynamoDB**

DynamoDB is used for notification storage.

During local development, DynamoDB is provided through LocalStack.

Table: `fraud-notifications`

Notification records contain information such as:
- paymentId
- senderId
- receiverId
- amount
- currency
- riskLevel
- status
- message
- ipAddress
- deviceId
- createdAt

**Amazon S3**

S3 is used for fraud audit-log archival.

During local development, S3 is provided through LocalStack.

Bucket: `fraud-audit-logs`

Example object:

```
audit-logs/2026/08/27/{paymentId}.json
```

Example audit record:

```json
{
  "paymentId": "1740d816-463d-4db0-a923-81cc432c02d8",
  "senderId": "final-demo-user",
  "receiverId": "final-demo-merchant",
  "amount": 75000.00,
  "currency": "USD",
  "riskLevel": "CRITICAL",
  "status": "FRAUD_ALERT",
  "message": "CRITICAL fraud alert detected. Immediate investigation required."
}
```

## 🐳 Infrastructure

Docker Compose provides the local infrastructure required by the application.

| Container | Technology | Port |
|---|---|---|
| fraud-postgres | PostgreSQL 15 | 5432 |
| fraud-redis | Redis 7 | 6379 |
| fraud-zookeeper | Zookeeper | 2181 |
| fraud-kafka | Apache Kafka | 9092 |
| fraud-kafka-ui | Kafka UI | 8090 |
| fraud-localstack | LocalStack | 4566 |

## 📋 Prerequisites

Install the following before running the project:
- Java 17+
- Maven 3.8+
- Python 3.10+
- Node.js 18+
- npm
- Docker
- Docker Compose
- OpenAI API key with active credits

## ⚡ Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/deepakbarajati/fraud-detection-system.git
cd fraud-detection-system
```

### 2. Start Infrastructure

```bash
docker compose up -d
```

Verify:

```bash
docker ps
```

### 3. Start Payment Service

Open a terminal:

```bash
cd payment-service
mvn spring-boot:run
```

Service: http://localhost:8081

### 4. Start Fraud Detection Service

Open another terminal:

```bash
cd fraud-detection-service
mvn spring-boot:run
```

Service: http://localhost:8082

### 5. Start Notification Service

Open another terminal:

```bash
cd notification-service
mvn spring-boot:run
```

Service: http://localhost:8083

### 6. Start AI Reasoning Service

Open another terminal:

```bash
cd ai-reasoning-service

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

Configure your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key
```

Start the service:

```bash
python main.py
```

Service: http://localhost:8084

### 7. Start API Gateway

Open another terminal:

```bash
cd api-gateway
mvn spring-boot:run
```

Gateway: http://localhost:8080

### 8. Start Fraud Dashboard

Open another terminal:

```bash
cd fraud-dashboard

npm install
npm run dev
```

Dashboard: http://localhost:5173

## 🔌 Ports & URLs

| Component | Port | URL |
|---|---|---|
| Fraud Dashboard | 5173 | http://localhost:5173 |
| API Gateway | 8080 | http://localhost:8080 |
| Payment Service | 8081 | http://localhost:8081 |
| Fraud Detection Service | 8082 | http://localhost:8082 |
| Notification Service | 8083 | http://localhost:8083 |
| AI Reasoning Service | 8084 | http://localhost:8084 |
| Kafka UI | 8090 | http://localhost:8090 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Zookeeper | 2181 | localhost:2181 |
| LocalStack | 4566 | http://localhost:4566 |

## ❤️ Health Checks

**API Gateway**

```bash
curl http://localhost:8080/actuator/health
```

**Payment Service**

```bash
curl http://localhost:8081/actuator/health
```

**Fraud Detection Service**

```bash
curl http://localhost:8082/actuator/health
```

**Notification Service**

```bash
curl http://localhost:8083/actuator/health
```

**AI Reasoning Service**

```bash
curl http://localhost:8084/health
```

Expected response:

```json
{
  "status": "UP"
}
```

## 🧪 End-to-End Test

### Step 1 — Create a High-Risk Payment

Use the API Gateway as the entry point:

```bash
curl -i -X POST http://localhost:8080/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "demo-user",
    "receiverId": "demo-merchant",
    "amount": 75000.00,
    "currency": "USD",
    "ipAddress": "45.33.32.156",
    "deviceId": "unknown-demo-device"
  }'
```

Expected initial status: `PENDING`

### Step 2 — Fraud Analysis

The Payment Service publishes the payment event to: `payment-events`

The Fraud Detection Service consumes the event and evaluates:
- Amount
- IP address
- Device
- Sender/receiver relationship

For the example above, the expected result is:

```
Risk Score: 90
Risk Level: CRITICAL
```

### Step 3 — Check Fraud Alert

Replace `{PAYMENT_ID}` with the ID returned from Step 1:

```bash
curl http://localhost:8080/api/v1/fraud/alerts/payment/{PAYMENT_ID}
```

Expected:

```json
{
  "riskScore": 90.0,
  "riskLevel": "CRITICAL",
  "status": "OPEN"
}
```

### Step 4 — Check Payment Status

```bash
curl http://localhost:8080/api/v1/payments/{PAYMENT_ID}
```

Expected: `FLAGGED`

### Step 5 — Verify Kafka Fraud Alert

```bash
docker exec fraud-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic fraud-alerts \
  --from-beginning \
  --timeout-ms 5000
```

A fraud alert should appear in the fraud-alerts topic.

### Step 6 — Verify DynamoDB Notification

LocalStack provides the DynamoDB environment.

List tables:

```bash
docker exec fraud-localstack awslocal dynamodb list-tables
```

Expected table: `fraud-notifications`

Scan notifications:

```bash
docker exec fraud-localstack awslocal dynamodb scan \
  --table-name fraud-notifications
```

### Step 7 — Verify S3 Audit Log

List buckets:

```bash
docker exec fraud-localstack awslocal s3 ls
```

List audit logs:

```bash
docker exec fraud-localstack awslocal s3 ls \
  s3://fraud-audit-logs \
  --recursive
```

## 🛡️ Circuit Breaker Test

The API Gateway protects the Fraud Detection Service using a circuit breaker.

Stop Fraud Detection Service:

```bash
kill <FRAUD_SERVICE_PID>
```

Verify that port 8082 is no longer listening:

```bash
sudo ss -ltnp | grep ':8082'
```

Then request fraud alerts through the Gateway:

```bash
curl -i http://localhost:8080/api/v1/fraud/alerts
```

Expected:

```
HTTP/1.1 503 Service Unavailable
```

Response:

```json
{
  "service": "fraud-detection-service",
  "status": "UNAVAILABLE",
  "message": "Fraud detection service is temporarily unavailable. Please try again later."
}
```

This verifies that the Gateway fallback is functioning correctly.

## 🌐 CORS

CORS is centrally configured at the API Gateway.

Development frontend: `http://localhost:5173`

Supported methods include:
- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS

The dashboard communicates with the backend through `http://localhost:8080` rather than directly accessing individual backend services.

## 📖 API Documentation

- Payment Service: http://localhost:8081/swagger-ui.html
- Fraud Detection Service: http://localhost:8082/swagger-ui.html
- Notification Service: http://localhost:8083/swagger-ui.html
- AI Reasoning Service: http://localhost:8084/docs

## 📊 Kafka UI

Kafka UI is available at: http://localhost:8090

It can be used to inspect:
- Topics
- Partitions
- Messages
- Consumer Groups
- Offsets

Important topics:
- payment-events
- fraud-alerts

## 📁 Project Structure

```
fraud-detection-system/
│
├── api-gateway/
│   ├── src/main/java/
│   │   └── com/frauddetection/gateway/
│   │       ├── controller/
│   │       │   └── FallbackController.java
│   │       └── ApiGatewayApplication.java
│   └── src/main/resources/
│       └── application.yaml
│
├── payment-service/
│   ├── src/main/java/
│   │   └── com/frauddetection/payment/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── kafka/
│   │       ├── model/
│   │       ├── dto/
│   │       └── config/
│   └── src/test/
│
├── fraud-detection-service/
│   ├── src/main/java/
│   │   └── com/frauddetection/fraud/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── kafka/
│   │       ├── config/
│   │       ├── model/
│   │       └── dto/
│   └── src/test/
│
├── notification-service/
│   ├── src/main/java/
│   │   └── com/frauddetection/notification/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── kafka/
│   │       ├── config/
│   │       ├── dto/
│   │       └── model/
│   └── src/test/
│
├── ai-reasoning-service/
│   ├── app/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   │       ├── fraud_analyzer.py
│   │       └── fraud_agent.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── fraud-dashboard/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   ├── fraudApi.ts
│   │   │   └── paymentApi.ts
│   │   └── types/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── architecture.svg
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md
```

## 🧪 Verification

The following parts of the system have been verified during development.

**Infrastructure**

```
PostgreSQL    → UP
Redis         → UP
Kafka         → UP
Zookeeper     → UP
LocalStack    → UP
Kafka UI      → UP
```

**Backend Services**

```
API Gateway          :8080 → UP
Payment Service      :8081 → UP
Fraud Detection      :8082 → UP
Notification Service :8083 → UP
```

**AI Service**

```
AI Reasoning Service :8084 → UP
```

**Dashboard**

Production build successfully completes using:

```bash
npm run build
```

**Kafka E2E**

Verified event flow:

```
Payment
   ↓
payment-events
   ↓
Fraud Detection
   ↓
Fraud Alert
   ↓
fraud-alerts
   ↓
Notification Service
```

**Notification E2E**

Verified that a CRITICAL fraud event produces:

```
DynamoDB Notification
+
S3 Audit Log
```

**Gateway Resilience**

Verified:

```
Fraud Service DOWN
        ↓
Gateway Request
        ↓
503 Fallback Response
```

## ☁️ AWS Deployment — Planned

The current development environment uses Docker Compose and LocalStack.

The architecture can be extended to AWS using:

| AWS Service | Purpose |
|---|---|
| ECS Fargate | Containerized microservices |
| Amazon MSK | Managed Kafka |
| Aurora PostgreSQL | Managed relational database |
| ElastiCache Redis | Managed caching |
| DynamoDB | Notification and alert storage |
| S3 | Audit-log archival |
| Cognito | Authentication |
| API Gateway | Managed API Gateway |
| CloudWatch | Monitoring and logging |

## 🔐 Security Considerations

For production deployment, the following improvements are recommended:
- Authentication and authorization
- OAuth2 / JWT
- Role-based access control
- AWS Secrets Manager
- TLS for service communication
- Kafka authentication and encryption
- Secure database credentials
- API rate limiting
- Input validation
- Structured security auditing
- IAM least-privilege policies
- Network isolation using VPC/private subnets

The current project is designed as a production-style development and demonstration system.

## 🚧 Future Improvements

- 🔐 JWT/OAuth2 authentication
- 👥 Role-based access control
- 📈 Advanced fraud analytics
- 🔎 Advanced fraud investigation workflows
- 🤖 ML-based fraud prediction
- 🧠 Real-time AI-assisted investigation
- 📬 Email/SMS fraud notifications
- 📊 Prometheus + Grafana monitoring
- ☁️ Full AWS CDK deployment
- 🐳 Containerization of all application services
- ☸️ Kubernetes deployment
- 🔄 CI/CD using GitHub Actions
- 🧪 Expanded integration and load testing

## 👤 Author

**Deepak Barajati**

B.Tech Information Technology

**Technologies**

- Java
- Spring Boot
- Spring Cloud
- Apache Kafka
- PostgreSQL
- Redis
- AWS
- Docker
- Python
- FastAPI
- LangChain
- LangGraph
- React
- TypeScript
- Vite

**GitHub**

https://github.com/deepakbarajati

## 📄 License

This project is licensed under the terms of the repository's LICENSE file.