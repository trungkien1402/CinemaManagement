package com.cinema.project.repositories;

import com.cinema.project.model.Voucher;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, String> {

    @Modifying(clearAutomatically = true) // <-- QUAN TRỌNG: Xóa cache để cập nhật số liệu mới ngay lập tức
    @Query("UPDATE Voucher v SET v.usedCount = v.usedCount + 1 WHERE v.voucherCode = :code AND v.usedCount < v.maxUses")
    int incrementUsedCount(@Param("code") String code);
}