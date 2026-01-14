# Block-Aid Project Configuration

## Environment Variables

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://user:password@localhost/block_aid

# Blockchain
WEB3_PROVIDER_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...
CONTRACT_ABI=[...]

# Flask
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=jwt-secret-key

# API
API_HOST=0.0.0.0
API_PORT=5000
WORKERS=4
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
VITE_WEB3_PROVIDER=http://localhost:8545
VITE_CONTRACT_ADDRESS=0x...
```

### Smart Contracts (.env)
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
PRIVATE_KEY=your-private-key
ETHERSCAN_API_KEY=your-api-key
```

## Docker Setup

```bash
docker-compose up -d
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Hardhat: http://localhost:8545
- PostgreSQL: localhost:5432

## Manual Setup

### 1. Smart Contracts
```bash
cd smart-contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat node  # For local development
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
export FLASK_APP=app.py
flask db init
flask db migrate
flask run
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. AI Model
```bash
cd ai-model
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python disaster_model.py
```

## Production Deployment

### Backend
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend
```bash
npm run build
npm run preview
# or serve with Nginx/Apache
```

### Smart Contracts
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Testing

### Smart Contracts
```bash
cd smart-contracts
npx hardhat test
```

### Backend
```bash
cd backend
pytest tests/
```

### Frontend
```bash
cd frontend
npm test
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

### Database Issues
```bash
# Reset PostgreSQL
dropdb block_aid
createdb block_aid
flask db stamp head
flask db migrate
flask db upgrade
```

### Blockchain Connection
```bash
# Check if Hardhat is running
curl http://localhost:8545 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}'
```

## Performance Tuning

### Backend
- Increase workers: `gunicorn -w 8`
- Enable caching: Set `CACHE_ENABLED=true`
- Database connection pooling: `POOL_SIZE=20`

### Frontend
- Enable production build: `npm run build`
- Enable caching headers in production
- Use CDN for static assets

### Blockchain
- Use Layer 2 solutions for faster transactions
- Implement transaction batching
- Use event filters for monitoring

## Security Checklist

- [ ] Change default passwords
- [ ] Set strong JWT secrets
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set rate limits
- [ ] Enable audit logging
- [ ] Use environment variables for secrets
- [ ] Validate all inputs
- [ ] Keep dependencies updated
- [ ] Regular security audits
