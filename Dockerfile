FROM golang:1.23

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY main.go ./
COPY templates ./templates

RUN go build -o main .

EXPOSE 3000

CMD ["./main"]
