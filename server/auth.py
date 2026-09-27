import os

from datetime import (
    datetime,
    timedelta
)

from jose import (
    jwt,
    JWTError
)

from dotenv import load_dotenv

from fastapi import (
    Depends,
    HTTPException
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)


load_dotenv()


JWT_SECRET = os.getenv(
    "JWT_SECRET"
)

JWT_ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256"
)

JWT_EXPIRE_MINUTES = int(
    os.getenv(
        "JWT_EXPIRE_MINUTES",
        1440
    )
)


security = HTTPBearer()


def create_access_token(
    user_id
):

    expiration = (
        datetime.utcnow()
        +
        timedelta(
            minutes=
                JWT_EXPIRE_MINUTES
        )
    )


    payload = {#if i want to add email for example to the token only add it here and then add it in the page that called the jwt function(main.py) and add the email to the token

        "user_id":
            user_id,

        "exp":
            expiration

    }


    token = jwt.encode(

        payload,

        JWT_SECRET,

        algorithm=
            JWT_ALGORITHM

    )


    return token


def get_current_user(
    credentials:
        HTTPAuthorizationCredentials
        = Depends(security)
):

    token = (
        credentials.credentials
    )


    try:

        payload = jwt.decode(

            token,

            JWT_SECRET,

            algorithms=[
                JWT_ALGORITHM
            ]

        )


        user_id = payload.get(
            "user_id"
        )


        if user_id is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )


        return user_id#here we return only userid bcz it is the only value but if it is more than 1 value we return the dictionary which is payload 


    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )