-- CreateTable
CREATE TABLE "balance" (
    "id" SERIAL NOT NULL,
    "currency" VARCHAR NOT NULL,
    "amount" VARCHAR NOT NULL,
    "walletId" INTEGER,
    "networkId" INTEGER,

    CONSTRAINT "PK_079dddd31a81672e8143a649ca0" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "network" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "nativeCurrency" VARCHAR NOT NULL,

    CONSTRAINT "PK_8f8264c2d37cbbd8282ee9a3c97" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" SERIAL NOT NULL,
    "ip" VARCHAR NOT NULL,
    "userAgent" VARCHAR NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "symbol" VARCHAR NOT NULL,
    "decimals" INTEGER NOT NULL,
    "address" VARCHAR NOT NULL,
    "network" VARCHAR NOT NULL,

    CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "hash" VARCHAR NOT NULL,
    "from" VARCHAR NOT NULL,
    "to" VARCHAR NOT NULL,
    "value" VARCHAR NOT NULL,
    "gasUsed" VARCHAR NOT NULL,
    "gasPrice" VARCHAR NOT NULL,
    "fee" VARCHAR NOT NULL,
    "networkId" INTEGER,
    "walletId" INTEGER,

    CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" VARCHAR,

    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR NOT NULL,
    "encryptedPrivateKey" VARCHAR NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "symbol" VARCHAR NOT NULL,
    "address" VARCHAR NOT NULL,

    CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_address_key" ON "wallet"("address");

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "FK_0c1dc7f402fc8c820fd22b19599" FOREIGN KEY ("networkId") REFERENCES "network"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "FK_5acde38cb734c647fe617df08ef" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "FK_72fe103c280a08073ede6b3a01d" FOREIGN KEY ("networkId") REFERENCES "network"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "FK_900eb6b5efaecf57343e4c0e79d" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "FK_35472b1fe48b6330cd349709564" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
