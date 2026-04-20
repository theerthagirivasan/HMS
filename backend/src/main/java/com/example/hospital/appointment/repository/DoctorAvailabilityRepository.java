package com.example.hospital.appointment.repository;

import com.example.hospital.appointment.entity.DoctorAvailability;
import com.example.hospital.appointment.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorAndAvailableDateOrderByStartTime(User doctor, LocalDate date);

    boolean existsByDoctorAndAvailableDateAndStartTimeAndEndTime(
            User doctor, LocalDate availableDate, LocalTime startTime, LocalTime endTime);

    List<DoctorAvailability> findByDoctorAndAvailableDateGreaterThanEqualOrderByAvailableDateAscStartTimeAsc(
            User doctor, LocalDate fromDate);
}

