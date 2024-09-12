<h1 align='center'>

AIR WALLET

</h1>

Built with a focus on speed and reliability, this project leverages a microservices architecture for optimal performance. Its modular design ensures seamless scalability and maintenance. Developed with cutting-edge technologies, it delivers unparalleled efficiency and robustness.

</br>

## Powered with:

*   <img align="left" src="https://img.shields.io/badge/Nest-7D3EEC?style=for-the-badge&logo=nestjs&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/PostgreSQL-7638E3?style=for-the-badge&logo=postgresql&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/RabbitMQ-6B2ED7?style=for-the-badge&logo=rabbitmq&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/Redis-662BCF?style=for-the-badge&logo=redis&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/TypeScript-6128C7?style=for-the-badge&logo=typescript&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/Prisma-5C26BE?style=for-the-badge&logo=prisma&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/JWT-5724B4?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/Swagger-4D20A0?style=for-the-badge&logo=swagger&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/Jest-4D2CAC?style=for-the-badge&logo=jest&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/Docker-4D2CAC?style=for-the-badge&logo=docker&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/Ethereum-4D39B9?style=for-the-badge&logo=Ethereum&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/Polygon-4D45C6?style=for-the-badge&logo=Polygon&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/Ethers.js-4D52D2?style=for-the-badge&logo=ethereum&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/alchemy-4D5EDF?style=for-the-badge&logo=alchemy&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/CryptoJS-4D78F8?style=for-the-badge&logo=cryptography&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/BCRYPT-4D84FF?style=for-the-badge&logo=bcrypt.js-js&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/nodemailer-4D91FF?style=for-the-badge&logo=nodemailer.js-js&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/Node.js-4D9EFF?style=for-the-badge&logo=nodedotjs&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/Express-4DAAFF?style=for-the-badge&logo=express&logoColor=white" />\
    </span>

*   <img align="left" src="https://img.shields.io/badge/yarn-4DB7FF?style=for-the-badge&logo=yarn&logoColor=white" />\
    </span>

</br>

## Setup

Create .env file and set parameters

```
RABBITMQ_DEFAULT_USER=
RABBITMQ_DEFAULT_PASS=

POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

AUTH_SERVICE_RMQ_URL=
AUTH_SERVICE_RMQ_QUEUE=

USER_SERVICE_RMQ_URL=
USER_SERVICE_RMQ_QUEUE=

WALLET_SERVICE_RMQ_URL=
WALLET_SERVICE_RMQ_QUEUE=

REDIS_URL=
REDIS_MAX=
REDIS_TTL=

ADMIN_API_KEY=

DATABASE_URL=

EXPIRATION=

JWT_SECRET=

EMAIL_USER=
EMAIL_PASS=

ETHEREUM_RPC_URL=
POLYGON_RPC_URL=

ENCRYPTION_KEY=

```

## Run

```
docker compose up --build
```

## Apps:

-   [API-GATEWAY](apps/api-gateway/README.md)
-   [AUTH-SERVICE](apps/auth-service/README.md)
-   [USER-SERVICE](apps/user-service/README.md)
-   [WALLET-SERVICE](apps/wallet-service/README.md)
