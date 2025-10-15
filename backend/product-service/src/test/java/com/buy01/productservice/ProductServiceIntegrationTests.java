package com.buy01.productservice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.buy01.productservice.dto.ProductRequest;
import com.buy01.productservice.exception.ApiException;
import com.buy01.productservice.service.ProductService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class ProductServiceIntegrationTests {

    @Container
    private static final MongoDBContainer MONGO = new MongoDBContainer("mongo:6.0.6");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", MONGO::getReplicaSetUrl);
        registry.add("media.service.enabled", () -> "false");
    }

    @Autowired
    private ProductService productService;

    private ProductRequest productRequest;

    @BeforeEach
    void init() {
        productRequest = new ProductRequest();
        productRequest.setName("Laptop");
        productRequest.setDescription("High-end laptop");
        productRequest.setPrice(new BigDecimal("1999.90"));
        productRequest.setMediaIds(List.of());
    }

    @Test
    void sellerCanCreateAndUpdateOwnProduct() {
        var created = productService.createProduct("seller-1", productRequest);
        assertThat(created.getId()).isNotNull();
        assertThat(created.getSellerId()).isEqualTo("seller-1");

        productRequest.setDescription("Updated");
        var updated = productService.updateProduct(created.getSellerId(), created.getId(), productRequest);
        assertThat(updated.getDescription()).isEqualTo("Updated");
    }

    @Test
    void sellerCannotModifyAnotherSellerProduct() {
        var created = productService.createProduct("seller-owner", productRequest);
        assertThrows(ApiException.class, () -> productService.updateProduct("other", created.getId(), productRequest));
    }
}
