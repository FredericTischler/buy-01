package com.buy01.productservice.service;

import com.buy01.productservice.model.Product;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ProductEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ProductEventPublisher.class);

    public void productCreated(Product product) {
        log.info("[KafkaHook] Product created - id={} seller={} name={}", product.getId(), product.getSellerId(), product.getName());
    }

    public void productUpdated(Product product) {
        log.info("[KafkaHook] Product updated - id={} seller={} name={}", product.getId(), product.getSellerId(), product.getName());
    }

    public void productDeleted(Product product) {
        log.info("[KafkaHook] Product deleted - id={} seller={} name={}", product.getId(), product.getSellerId(), product.getName());
    }
}
