# Block-Aid: Complete System Architecture

## System Overview

Block-Aid is a full-stack application integrating AI, Blockchain, and Web technologies for disaster relief management.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Interface Layer                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite)                                        │  │
│  │  - Dashboard                                             │  │
│  │  - Event Creation                                        │  │
│  │  - Fund Management                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────────┐
│                  API Layer (Flask)                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  REST API Endpoints                                      │  │
│  │  - Event Management                                      │  │
│  │  - Image Processing                                      │  │
│  │  - Fund Operations                                       │  │
│  │  - Audit Logging                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─┬──────────────────────────────────────────────┬────────────────┘
  │                                              │
  │ Python                                       │ Web3.js
  ▼                                              ▼
┌──────────────────────┐              ┌─────────────────────────┐
│  AI/ML Pipeline      │              │  Blockchain Layer       │
│ ┌────────────────┐   │              │ ┌───────────────────┐   │
│ │ EfficientNet-B0│   │              │ │ Smart Contracts   │   │
│ │ Model          │   │              │ │ - DisasterRelief  │   │
│ │ (TensorFlow)   │   │              │ │ - BlockAidToken   │   │
│ └────────────────┘   │              │ └───────────────────┘   │
│ ┌────────────────┐   │              │ ┌───────────────────┐   │
│ │ Severity       │   │              │ │ Ethereum Network  │   │
│ │ Calculator     │   │              │ │ (Hardhat/Testnet) │   │
│ └────────────────┘   │              │ └───────────────────┘   │
└──────────────────────┘              └─────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  Data Layer                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │  PostgreSQL    │  │  Image Storage │  │  Blockchain      │   │
│  │  Database      │  │  (File System) │  │  (Immutable)     │   │
│  └────────────────┘  └────────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Layer (React)

**Technology**: React 18 + Vite + Tailwind CSS

**Components**:
- Navigation bar
- Event list with filtering
- Event creation form with image upload
- Event details view
- Fund management interface
- Dashboard with analytics

**State Management**: Zustand for global state
**API Integration**: Axios with interceptors for authentication

### 2. API Layer (Flask)

**Core Features**:
- RESTful endpoints for all operations
- JWT authentication and authorization
- Rate limiting (200 req/day, 50 req/hour)
- CORS support
- Comprehensive error handling
- Audit logging

**Database**:
- SQLAlchemy ORM
- Models: User, DisasterEvent, DisasterFund, AuditLog
- PostgreSQL for production, SQLite for development

### 3. AI/ML Pipeline

**Model**: EfficientNet-B0 (pre-trained on ImageNet)

**Process**:
1. Image preprocessing (resize, normalize)
2. Feature extraction
3. Severity classification (LOW, MEDIUM, HIGH)
4. Probability output

**Severity Scoring**:
- Combines AI prediction with environmental factors
- Weighted multi-factor calculation
- Confidence scoring based on factor consistency
- Final score: 0-100 scale

### 4. Blockchain Layer

**Smart Contracts**:

**DisasterRelief.sol**
```solidity
- createDisasterEvent(): Record disaster with AI analysis
- verifyDisasterEvent(): Manual verification step
- donateToEvent(): Record donation transactions
- createAndApproveFund(): Fund pool creation
- distributeFund(): Safe fund distribution
- Access control via authorized officials
```

**BlockAidToken.sol**
- ERC20 compliant token
- Used for donations and fund transfers

**Key Features**:
- Immutable record keeping
- Transparent transaction history
- Duplicate prevention via image hashing
- Role-based access control

## Data Flow

### Event Creation Flow

```
1. User uploads disaster image + parameters
2. Backend receives form data
3. Calculate image hash (SHA-256)
4. Check for duplicates on blockchain
5. AI model analyzes image
6. Severity calculator combines factors
7. Save event to database
8. Record event hash on blockchain
9. Return results to frontend
10. Display severity assessment
```

### Fund Distribution Flow

```
1. Official verifies disaster event
2. Event recorded on blockchain
3. Official creates fund pool
4. Fund stored in smart contract
5. Donors contribute funds (ETH/BAID tokens)
6. Transactions recorded on blockchain
7. Official approves distribution
8. Funds transferred to recipient
9. Transaction immutably recorded
10. Audit trail updated
```

## Security Architecture

### Authentication
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- HTTPS in production

### Authorization
- Role-based access control (RBAC)
  - Donor: Can donate funds
  - Official: Can verify events and approve funds
  - NGO: Can report events and manage funds
  - Admin: Full access

### Data Integrity
- Image hashing to prevent duplicates
- Blockchain immutability for critical records
- Audit logging of all operations
- Rate limiting to prevent abuse

### Smart Contract Security
- Input validation
- Reentrancy guards
- Safe math operations
- Access control via modifiers

## Deployment Considerations

### Development
- Local Hardhat network for testing
- SQLite database
- Mock authentication

### Staging
- Sepolia testnet
- PostgreSQL database
- JWT authentication

### Production
- Ethereum mainnet or Layer 2
- Managed database service
- Advanced authentication (2FA)
- CDN for frontend
- Load balancing
- Monitoring and alerting

## Performance Optimization

### Frontend
- Code splitting with lazy loading
- Image optimization
- Caching strategies
- Minification and compression

### Backend
- Database query optimization
- Caching for frequently accessed data
- Async image processing
- Connection pooling

### Blockchain
- Gas optimization in smart contracts
- Batch processing for transactions
- State channels for scalability

## Scalability Roadmap

### Phase 1: Current
- Single server deployment
- SQLite/PostgreSQL
- Ethereum testnet

### Phase 2: Growth
- Microservices architecture
- Distributed caching (Redis)
- Load balancing
- Auto-scaling

### Phase 3: Enterprise
- Kubernetes orchestration
- Multi-region deployment
- Layer 2 blockchain solutions
- Decentralized storage (IPFS)

## Monitoring & Logging

- Application logging to files and stdout
- Audit trail in database
- Blockchain event monitoring
- Performance metrics collection
- Error tracking and alerting

## Integration Points

### External APIs
- Satellite imagery services (optional)
- Weather data providers
- Government disaster alerts

### Blockchain Networks
- Ethereum (mainnet/testnet)
- Layer 2 solutions (Polygon, Arbitrum)

## Future Enhancements

1. **Real-time satellite integration**: Automatic disaster detection
2. **IoT sensor integration**: Real-time environmental data
3. **Mobile application**: Native mobile clients
4. **Multi-chain support**: Polygon, Arbitrum, etc.
5. **Advanced ML models**: Multi-modal learning
6. **Decentralized governance**: DAO for fund decisions
7. **Insurance integration**: Parametric insurance
8. **Supply chain tracking**: Disaster relief supplies

---

For detailed component documentation, refer to individual README files in each directory.
