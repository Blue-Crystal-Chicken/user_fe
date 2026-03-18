
// User
// id          BIGSERIAL       NOT NULL,
//     Name        VARCHAR(255)    NOT NULL,
//     Surname     VARCHAR(255)    NOT NULL,
//     Birthday    DATE,
//     Email       VARCHAR(255)    NOT NULL UNIQUE,
//     Password    VARCHAR(255)    NOT NULL,
//     Gender      VARCHAR(50),
//     Phone       VARCHAR(50),
//     Role        VARCHAR(50)     NOT NULL DEFAULT 'USER',
//     Created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     Updated_at  TIMESTAMP,
export interface User {
    id: string;
    name: string;
    surname: string;
    birthday: string;
    email: string;
    password: string;
    gender: string;
    phone: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserLogin {
    email: string;
    password: string;
}