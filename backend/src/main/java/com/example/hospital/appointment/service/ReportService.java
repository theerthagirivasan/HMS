package com.example.hospital.appointment.service;

import com.example.hospital.appointment.entity.*;
import com.example.hospital.appointment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Map<String, Object> getAppointmentReports() {
        Map<String, Object> report = new HashMap<>();
        
        long totalAppointments = appointmentRepository.count();
        report.put("totalAppointments", totalAppointments);
        
        Map<AppointmentStatus, Long> statusCount = Arrays.stream(AppointmentStatus.values())
                .collect(Collectors.toMap(
                        status -> status,
                        status -> (long) appointmentRepository.findByStatus(status).size()
                ));
        report.put("appointmentsByStatus", statusCount);
        
        LocalDate today = LocalDate.now();
        List<User> doctors = userRepository.findByRole(Role.DOCTOR);
        long todayAppointments = 0;
        
        for (User doctor : doctors) {
            todayAppointments += appointmentRepository.findByDoctorAndAppointmentDate(doctor, today).size();
        }
        
        report.put("todayAppointments", todayAppointments);
        
        Map<String, Long> monthlyStats = new HashMap<>();
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);
        
        long monthlyAppointments = 0;
        for (User doctor : doctors) {
            monthlyAppointments += appointmentRepository
                    .countAppointmentsByDoctorAndDateRange(doctor.getId(), startOfMonth, endOfMonth);
        }
        monthlyStats.put("currentMonth", monthlyAppointments);
        
        report.put("monthlyStats", monthlyStats);
        
        return report;
    }
    
    public List<Map<String, Object>> getDoctorReports() {
        List<User> doctors = userRepository.findByRole(Role.DOCTOR);
        List<Map<String, Object>> doctorReports = new ArrayList<>();
        
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);
        
        for (User doctor : doctors) {
            Map<String, Object> doctorReport = new HashMap<>();
            doctorReport.put("doctorId", doctor.getId());
            doctorReport.put("doctorName", doctor.getName());
            doctorReport.put("specialization", doctor.getSpecialization());
            
            List<Appointment> doctorAppointments = appointmentRepository.findByDoctor(doctor);
            doctorReport.put("totalAppointments", doctorAppointments.size());
            
            long monthlyAppointments = doctorAppointments.stream()
                    .filter(a -> !a.getAppointmentDate().isBefore(startOfMonth) && 
                                 !a.getAppointmentDate().isAfter(endOfMonth))
                    .count();
            doctorReport.put("monthlyAppointments", monthlyAppointments);
            
            Map<AppointmentStatus, Long> statusCount = Arrays.stream(AppointmentStatus.values())
                    .collect(Collectors.toMap(
                            status -> status,
                            status -> doctorAppointments.stream()
                                    .filter(a -> a.getStatus() == status)
                                    .count()
                    ));
            doctorReport.put("appointmentsByStatus", statusCount);
            
            doctorReports.add(doctorReport);
        }
        
        return doctorReports;
    }
}