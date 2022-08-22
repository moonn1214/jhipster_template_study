package com.jysoft.jyemr.web.rest;

import com.jysoft.jyemr.domain.User;
import com.jysoft.jyemr.repository.UserRepository;
import com.jysoft.jyemr.security.SecurityUtils;
import com.jysoft.jyemr.service.MailService;
import com.jysoft.jyemr.service.UserService;
import com.jysoft.jyemr.service.dto.AdminUserDTO;
import com.jysoft.jyemr.service.dto.PasswordChangeDTO;
import com.jysoft.jyemr.web.rest.errors.*;
import com.jysoft.jyemr.web.rest.vm.KeyAndPasswordVM;
import com.jysoft.jyemr.web.rest.vm.ManagedUserVM;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private static class AccountResourceException extends RuntimeException {

        private AccountResourceException(String message) {
            super(message);
        }
    }

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    private final UserRepository userRepository;

    private final UserService userService;

    private final MailService mailService;

    public AccountResource(UserRepository userRepository, UserService userService, MailService mailService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.mailService = mailService;
    }

    /**
     * {@code POST  /register} : register the user.
     *
     * @param managedUserVM the managed user View Model.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws LoginAlreadyUsedException {@code 400 (Bad Request)} if the login is already used.
     */
    // REGISTER 15. 요청에 의해 메소드 실행, created = 201 = 생성 요청 성공
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    // REGISTER 16. RequestBody에 의해 요청으로 넘어온 데이터인 login, email, password가 ManagedUserVM에 들어감
    public void registerAccount(@Valid @RequestBody ManagedUserVM managedUserVM) {
        // REGISTER 17. 패스워드 길이 검사
        // REGISTER 19. true 리턴 시(유효하지 않을 때) 예외 발생 후 종료
        if (isPasswordLengthInvalid(managedUserVM.getPassword())) {
            throw new InvalidPasswordException();
        }
        // REGISTER 20. 패스워드 유효성 검사 통과하면 UserService.java의 registerUser 메소드 실행(managedUserVM 객체와 패스워드를 넘김)
        // REGISTER 51. 새로운 유저 객체가 리턴되어 user에 할당
        User user = userService.registerUser(managedUserVM, managedUserVM.getPassword());
        // REGISTER 52. MailService.java의 sendActivationEmail 메소드 실행(새 유저 객체를 파라미터로 입력), 이메일을 전송
        mailService.sendActivationEmail(user);
    }

    /**
     * {@code GET  /activate} : activate the registered user.
     *
     * @param key the activation key.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be activated.
     */
    @GetMapping("/activate")
    public void activateAccount(@RequestParam(value = "key") String key) {
        Optional<User> user = userService.activateRegistration(key);
        if (!user.isPresent()) {
            throw new AccountResourceException("No user was found for this activation key");
        }
    }

    /**
     * {@code GET  /authenticate} : check if the user is authenticated, and return its login.
     *
     * @param request the HTTP request.
     * @return the login if the user is authenticated.
     */
    @GetMapping("/authenticate")
    public String isAuthenticated(HttpServletRequest request) {
        log.debug("REST request to check if the current user is authenticated");
        return request.getRemoteUser();
    }

    /**
     * {@code GET  /account} : get the current user.
     *
     * @return the current user.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be returned.
     */
    // LOGIN 42. (JWT 토큰, httpheaders, 상태 코드를 응답으로 받은)authentication.ts에서 요청을 보냄
    @GetMapping("/account")
    public AdminUserDTO getAccount() {
        return userService
            // LOGIN 43. UserService의 getUserWithAuthorities 메소드 호출
            // 현재 로그인 정보 가져옴
            .getUserWithAuthorities()
            // LOGIN 44. 가져온 정보로 AdminUserDTO 생성 후 반환
            // authorities = [ROLE_USER, ROLE_ADMIN] 이면 admin
            .map(AdminUserDTO::new)
            // orElseThrow 에러 처리
            .orElseThrow(() -> new AccountResourceException("User could not be found"));
    }

    /**
     * {@code POST  /account} : update the current user information.
     *
     * @param userDTO the current user information.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user login wasn't found.
     */
    // SETTINGS 18. settings.reducer.ts에서 post 방식으로 요청을 보냈음
    @PostMapping("/account")
    // SETTINGS 19. 요청으로 넘어온 계정 정보 account를 RequestBody에 의해 AdminUserDTO 타입의 객체 userDTO에 넣음, Valid에 의해 검증
    public void saveAccount(@Valid @RequestBody AdminUserDTO userDTO) {
        // SETTINGS 20. 현재 로그인한 유저의 아이디를 userLogin 변수에 할당
        String userLogin = SecurityUtils
            .getCurrentUserLogin()
            // orElseThrow 에러 처리
            .orElseThrow(() -> new AccountResourceException("Current user login not found"));
        // SETTINGS 21. 넘어온 계정 정보의 이메일로 userRepository에서 유저 정보를 찾아서 existingUser에 넣음 
        Optional<User> existingUser = userRepository.findOneByEmailIgnoreCase(userDTO.getEmail());
        // SETTINGS 22. 넘어온 계정 정보의 이메일로 찾은 유저가 존재하고
        // 넘어온 계정 정보의 이메일로 찾은 유저의 아이디와 현재 로그인한 유저의 아이디를 비교한 값 => ! result
        // && => true 이면 서로 다른 것 => 아래 예외 처리 후 종료
        if (existingUser.isPresent() && (!existingUser.get().getLogin().equalsIgnoreCase(userLogin))) {
            throw new EmailAlreadyUsedException();
        }
        // SETTINGS 23. false이면 현재 로그인한 유저의 아이디로 userRepository에서 유저 정보를 가져와 user에 할당
        Optional<User> user = userRepository.findOneByLogin(userLogin);
        // SETTINGS 24. 유저가 존재하지 않으면 예외 처리 후 종료
        if (!user.isPresent()) {
            throw new AccountResourceException("User could not be found");
        }
        // SETTINGS 25. UserService의 updateUser 메소드 실행 (UserService.java)
        userService.updateUser(
            userDTO.getFirstName(),
            userDTO.getLastName(),
            userDTO.getEmail(),
            userDTO.getLangKey(),
            userDTO.getImageUrl()
        );
    }

    /**
     * {@code POST  /account/change-password} : changes the current user's password.
     *
     * @param passwordChangeDto current and new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the new password is incorrect.
     */
    @PostMapping(path = "/account/change-password")
    public void changePassword(@RequestBody PasswordChangeDTO passwordChangeDto) {
        if (isPasswordLengthInvalid(passwordChangeDto.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        userService.changePassword(passwordChangeDto.getCurrentPassword(), passwordChangeDto.getNewPassword());
    }

    /**
     * {@code POST   /account/reset-password/init} : Send an email to reset the password of the user.
     *
     * @param mail the mail of the user.
     */
    @PostMapping(path = "/account/reset-password/init")
    public void requestPasswordReset(@RequestBody String mail) {
        Optional<User> user = userService.requestPasswordReset(mail);
        if (user.isPresent()) {
            mailService.sendPasswordResetMail(user.get());
        } else {
            // Pretend the request has been successful to prevent checking which emails really exist
            // but log that an invalid attempt has been made
            log.warn("Password reset requested for non existing mail");
        }
    }

    /**
     * {@code POST   /account/reset-password/finish} : Finish to reset the password of the user.
     *
     * @param keyAndPassword the generated key and the new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the password could not be reset.
     */
    @PostMapping(path = "/account/reset-password/finish")
    public void finishPasswordReset(@RequestBody KeyAndPasswordVM keyAndPassword) {
        if (isPasswordLengthInvalid(keyAndPassword.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        Optional<User> user = userService.completePasswordReset(keyAndPassword.getNewPassword(), keyAndPassword.getKey());

        if (!user.isPresent()) {
            throw new AccountResourceException("No user was found for this reset key");
        }
    }

    // REGISTER 18. 패스워드 유효성 검사
    // 패스워드가 비어있다, 최소 길이보다 작다, 최대 길이보다 길다, 하나라도 true이면 true 리턴
    private static boolean isPasswordLengthInvalid(String password) {
        return (
            StringUtils.isEmpty(password) ||
            password.length() < ManagedUserVM.PASSWORD_MIN_LENGTH ||
            password.length() > ManagedUserVM.PASSWORD_MAX_LENGTH
        );
    }
}
