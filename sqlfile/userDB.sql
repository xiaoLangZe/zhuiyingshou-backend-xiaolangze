CREATE TABLE
    IF NOT EXISTS "main"."userMeta" (
        "userID" INTEGER NOT NULL,
        "email" TEXT,
        "phoneNum" INTEGER,
        "passwd" TEXT,
        "allIncome" integer,
        "usedIncome" integer,
        "remainingIncome" integer,
        "level" integer,
        "experience" integer,
        "points" integer,
        PRIMARY KEY ("userID")
    );
