package com.odontologia.controller;

import com.odontologia.model.Notice;
import com.odontologia.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "*")
public class NoticeController {

    @Autowired
    private NoticeRepository repository;

    @GetMapping
    public List<Notice> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<Notice> save(@RequestBody Notice notice) {
        if (notice.getId() == null || notice.getId().isEmpty()) {
            notice.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.ok(repository.save(notice));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
