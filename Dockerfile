FROM golang:1.23

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY main.go ./
COPY templates ./templates

RUN go build -o main .

EXPOSE 8080

CMD ["./main"]