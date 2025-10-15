package com.buy01.productservice.mapper;

import com.buy01.productservice.dto.ProductMediaResponse;
import com.buy01.productservice.dto.ProductRequest;
import com.buy01.productservice.dto.ProductResponse;
import com.buy01.productservice.model.Product;
import com.buy01.productservice.model.ProductMedia;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setSellerId(product.getSellerId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setMedia(product.getMedia().stream()
                .map(media -> new ProductMediaResponse(media.getMediaId(), media.getSecureUrl()))
                .collect(Collectors.toList()));
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }

    public void updateEntity(Product product, ProductRequest request, List<ProductMedia> media) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setMedia(media);
    }
}
