package com.buy01.productservice.service;

import com.buy01.productservice.dto.ProductRequest;
import com.buy01.productservice.dto.ProductResponse;
import com.buy01.productservice.exception.ApiException;
import com.buy01.productservice.mapper.ProductMapper;
import com.buy01.productservice.model.Product;
import com.buy01.productservice.model.ProductMedia;
import com.buy01.productservice.repository.ProductRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MediaClient mediaClient;
    private final ProductEventPublisher eventPublisher;

    public ProductService(
            ProductRepository productRepository,
            ProductMapper productMapper,
            MediaClient mediaClient,
            ProductEventPublisher eventPublisher) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.mediaClient = mediaClient;
        this.eventPublisher = eventPublisher;
    }

    @Cacheable("products")
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream().map(productMapper::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getSellerProducts(String sellerId) {
        return productRepository.findBySellerId(sellerId).stream().map(productMapper::toResponse).toList();
    }

    public ProductResponse getProduct(String productId) {
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        return productMapper.toResponse(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse createProduct(String sellerId, ProductRequest request) {
        Product product = new Product();
        product.setSellerId(sellerId);
        productMapper.updateEntity(product, request, resolveMedia(request, sellerId));
        Product saved = productRepository.save(product);
        eventPublisher.productCreated(saved);
        return productMapper.toResponse(saved);
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse updateProduct(String sellerId, String productId, ProductRequest request) {
        Product product = productRepository
                .findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "You cannot modify this product"));
        productMapper.updateEntity(product, request, resolveMedia(request, sellerId));
        Product saved = productRepository.save(product);
        eventPublisher.productUpdated(saved);
        return productMapper.toResponse(saved);
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(String sellerId, String productId) {
        Product product = productRepository
                .findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "You cannot delete this product"));
        productRepository.delete(product);
        eventPublisher.productDeleted(product);
    }

    private List<ProductMedia> resolveMedia(ProductRequest request, String sellerId) {
        List<String> mediaIds = request.getMediaIds();
        if (mediaIds == null) {
            return List.of();
        }
        return mediaClient.fetchProductMedia(mediaIds, sellerId);
    }
}
