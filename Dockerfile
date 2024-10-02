FROM golang:1.23

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY messages.db ./
COPY main.go ./
COPY templates ./templates
COPY deletion_info.json ./

RUN go build -o main .

EXPOSE 8080

CMD ["./main"]