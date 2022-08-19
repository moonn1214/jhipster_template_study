package com.jysoft.jyemr.web.rest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jysoft.jyemr.security.jwt.JWTFilter;
import com.jysoft.jyemr.security.jwt.TokenProvider;
import com.jysoft.jyemr.web.rest.vm.LoginVM;
import javax.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller to authenticate users.
 */
@RestController
@RequestMapping("/api")
public class UserJWTController {

    private final TokenProvider tokenProvider;

    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    public UserJWTController(TokenProvider tokenProvider, AuthenticationManagerBuilder authenticationManagerBuilder) {
        this.tokenProvider = tokenProvider;
        this.authenticationManagerBuilder = authenticationManagerBuilder;
    }

    // LOGIN 28. authentication.ts에서 username, password, rememberMe를 넘기며 요청하여 실행됨(@RequestBody로 loginVM에 들어감)
    // LoginVM => username, password, rememberMe
    @PostMapping("/authenticate")
    public ResponseEntity<JWTToken> authorize(@Valid @RequestBody LoginVM loginVM) {
        // LOGIN 29. 인증 처리 과정을 위해 spring security의 UsernamePasswordAuthenticationToken을 사용
        // username과 password를 조합하여 인스턴스 생성
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
            loginVM.getUsername(),
            loginVM.getPassword()
        );

        // LOGIN 30. authentication => UsernamePasswordAuthenticationToken [Principal=org.springframework.security.core.userdetails.User [Username=jkmoon, Password=[PROTECTED], Enabled=true, AccountNonExpired=true, credentialsNonExpired=true, AccountNonLocked=true, Granted Authorities=[ROLE_USER]], Credentials=[PROTECTED], Authenticated=true, Details=null, Granted Authorities=[ROLE_USER]]
        // 로그인 정보 인스턴스를 사용하여 인증 실행하고 결과 값을 통해 객체를 생성
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        // LOGIN 31. SecurityContextHolder는 누가 인증했는지에 대한 정보들을 저장하고 있음
        // SecurityContextHolder.getContext() => SecurityContextImpl [Authentication=UsernamePasswordAuthenticationToken [Principal=org.springframework.security.core.userdetails.User [Username=jkmoon, Password=[PROTECTED], Enabled=true, AccountNonExpired=true, credentialsNonExpired=true, AccountNonLocked=true, Granted Authorities=[ROLE_USER]], Credentials=[PROTECTED], Authenticated=true, Details=null, Granted Authorities=[ROLE_USER]]]
        // authentication 객체를 SecurityContext에 저장
        SecurityContextHolder.getContext().setAuthentication(authentication);
        // LOGIN 32. TokenProvider와 유저에 대한 정보로 JWT 토큰을 생성
        String jwt = tokenProvider.createToken(authentication, loginVM.isRememberMe());
        // LOGIN 33. http header 객체 생성
        HttpHeaders httpHeaders = new HttpHeaders();
        // LOGIN 34. httpheaders에 JWT 토큰을 넣음 (해당 유저의 로그인 정보를 검증)
        httpHeaders.add(JWTFilter.AUTHORIZATION_HEADER, "Bearer " + jwt);
        // LOGIN 35. JWT 토큰, httpheaders, 상태 코드를 응답 객체로 반환
        return new ResponseEntity<>(new JWTToken(jwt), httpHeaders, HttpStatus.OK);
    }

    /**
     * Object to return as body in JWT Authentication.
     */
    static class JWTToken {

        private String idToken;

        JWTToken(String idToken) {
            this.idToken = idToken;
        }

        @JsonProperty("id_token")
        String getIdToken() {
            return idToken;
        }

        void setIdToken(String idToken) {
            this.idToken = idToken;
        }
    }
}
