# Cinema-Ticket-Reservation-System

A project for design exercises in distributed systems that will create a cinema ticket reservation system.

## Overview

The Cinema Ticket Reservation System is a distributed system designed to manage cinema operations, including user management, movie scheduling, seat reservations, and payments. It supports multiple regions with separate databases for scalability and fault tolerance.

## Features

- **User Management**:

  - User registration, login, and profile management.
  - Role-based access control (Admin, Employee, User).
  - Password change and profile updates.
  - Admins can manage users (view, edit, delete).

- **Movie and Show Management**:

  - Admins can add, edit, and delete movies.
  - Shows can be scheduled with date, time, and ticket pricing.
  - Users can view movie details and available shows.

- **Hall and Seat Management**:

  - Admins can manage cinema halls and their seating arrangements.
  - Visualization of hall layouts with rows and seats.
  - Seat reservation status is displayed (reserved or available).

- **Reservation and Payment**:

  - Users can book seats for shows.
  - Reservation status includes reserved, paid, and canceled.
  - Payment processing with multiple methods (card, cash, online).

- **Multi-Region Support**:

  - Separate databases for different regions.
  - Region-based filtering for movies, shows, and halls.

- **Monitoring and Health Checks**:
  - API health check dashboard.
  - Admins can monitor the health of different user groups.

## Technologies Used

- **Frontend**: React, Bootstrap
- **Backend**: FastAPI, SQLAlchemy
- **Database**: PostgreSQL (Global and Regional)
- **Authentication**: JWT
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/Cinema-Ticket-Reservation-System.git
   cd Cinema-Ticket-Reservation-System
   ```

2. Set up environment variables:

   - Copy `.env.example` to `.env` and update the values as needed.

3. Start the services using Docker Compose:

   ```bash
   docker-compose up --build
   ```

4. Access the application:

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)

5. Run tests:
   ```bash
   cd backend/app
   poetry run pytest
   ```

<!-- ## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request. -->

## Entity-Relationship Diagram

```mermaid
erDiagram
    USERS-Global {
        int id
        strin username
        string first_name
        string last_name
        string email
        string hashed_password
        string role
    }

    HALLS {
        int id
        %% int cinema_id
        string name
    }

    HALL_ROWS {
        int id
        int hall_id
        int row_number
        int seat_count
    }

    SEATS {
        int id
        int row_id
        int seat_number
        string seat_type
    }

    MOVIES {
        int id
        string tmdbID
        string title
        datetime release_date
        string poster_path
        int runtime
        json genres
        string description
    }

    SHOWS {
        int id
        int movie_id
        int hall_id
        datetime start_time
        float price
    }

    RESERVATIONS {
        int id
        int user_id
        int show_id
        string status
        datetime created_at
    }

    RESERVATION_SEATS {
        int id
        int seat_id
        int reservation_id
    }

    PAYMENTS {
        int id
        int reservation_id
        float amount
        string payment_method
        string status
        string created_at
    }

    %% Relationships
    USERS-Global ||--o{ RESERVATIONS : "User makes"
    RESERVATIONS ||--o{ RESERVATION_SEATS : "contains"
    RESERVATION_SEATS }o--|| SEATS : "books"
    RESERVATIONS ||--o{ PAYMENTS : "has"
    HALLS ||--o{ HALL_ROWS : "has"
    HALL_ROWS ||--o{ SEATS : "contains"
    MOVIES ||--o{ SHOWS : "is played in"
    SHOWS ||--o{ RESERVATIONS : "is booked for"
    SHOWS ||--o{ HALLS : "takes place in"
    USERS-Global ||--o{ SHOWS : "Admin creates"

    %% Relationships
    USERS-Global ||--o{ RESERVATIONS : "User makes"
    RESERVATIONS ||--o{ RESERVATION_SEATS : "contains"
    RESERVATION_SEATS }o--|| SEATS : "books"
    RESERVATIONS ||--o{ PAYMENTS : "has"
    HALLS ||--o{ HALL_ROWS : "has"
    HALL_ROWS ||--o{ SEATS : "contains"
    MOVIES ||--o{ SHOWS : "is played in"
    SHOWS ||--o{ RESERVATIONS : "is booked for"
    SHOWS ||--o{ HALLS : "takes place in"
    USERS-Global ||--o{ SHOWS : "Admin creates"

    %% ENUM Descriptions (Mermaid does not support enums natively)
    %% Role: admin, staff, customer
    %% Seat Type: standard, premium, VIP
    %% Status (Reservations): reserved, paid, canceled
    %% Payment Method: card, cash, online
    %% Payment Status: pending, completed, failed
```
