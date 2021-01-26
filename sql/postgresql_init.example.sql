create table oauth2
(
    token  varchar not null
        constraint oauth2_pk
            primary key,
    value  varchar not null,
    expiry bigint
);
