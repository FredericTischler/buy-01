package com.buy01.productservice.controller;

import com.buy01.productservice.dto.ProductRequest;
import com.buy01.productservice.dto.ProductResponse;
import com.buy01.productservice.service.ProductService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductResponse> listProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{productId}")
    public ProductResponse getProduct(@PathVariable String productId) {
        return productService.getProduct(productId);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('SELLER')")
    public List<ProductResponse> myProducts(Principal principal) {
        return productService.getSellerProducts(principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SELLER')")
    public ProductResponse createProduct(@RequestBody @Valid ProductRequest request, Principal principal) {
        return productService.createProduct(principal.getName(), request);
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    public ProductResponse updateProduct(
            @PathVariable String productId, @RequestBody @Valid ProductRequest request, Principal principal) {
        return productService.updateProduct(principal.getName(), productId, request);
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SELLER')")
    public void deleteProduct(@PathVariable String productId, Principal principal) {
        productService.deleteProduct(principal.getName(), productId);
    }
}
