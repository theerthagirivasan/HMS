package com.example.hospital.appointment.repository;

import com.example.hospital.appointment.entity.Appointment;
import com.example.hospital.appointment.entity.User;
import com.example.hospital.appointment.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctor(User doctor);
    List<Appointment> findByPatient(User patient);
    List<Appointment> findByDoctorAndAppointmentDate(User doctor, LocalDate date);
    List<Appointment> findByPatientAndAppointmentDate(User patient, LocalDate date);
    List<Appointment> findByStatus(AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date")
    List<Appointment> findByDoctorIdAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
    
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentDate = :date")
    List<Appointment> findByPatientIdAndDate(@Param("patientId") Long patientId, @Param("date") LocalDate date);
    
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Appointment a " +
           "WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date " +
           "AND ((a.startTime <= :endTime AND a.endTime >= :startTime)) " +
           "AND a.status != 'CANCELLED'")
    boolean existsOverlappingAppointment(
        @Param("doctorId") Long doctorId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate BETWEEN :startDate AND :endDate")
    long countAppointmentsByDoctorAndDateRange(
        @Param("doctorId") Long doctorId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
}