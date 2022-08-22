package com.jysoft.jyemr.service;

import com.jysoft.jyemr.config.Constants;
import com.jysoft.jyemr.domain.Authority;
import com.jysoft.jyemr.domain.User;
import com.jysoft.jyemr.repository.AuthorityRepository;
import com.jysoft.jyemr.repository.UserRepository;
import com.jysoft.jyemr.security.AuthoritiesConstants;
import com.jysoft.jyemr.security.SecurityUtils;
import com.jysoft.jyemr.service.dto.AdminUserDTO;
import com.jysoft.jyemr.service.dto.UserDTO;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.security.RandomUtil;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class UserService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthorityRepository authorityRepository;

    private final CacheManager cacheManager;

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuthorityRepository authorityRepository,
        CacheManager cacheManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authorityRepository = authorityRepository;
        this.cacheManager = cacheManager;
    }

    public Optional<User> activateRegistration(String key) {
        log.debug("Activating user for activation key {}", key);
        return userRepository
            .findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                this.clearUserCaches(user);
                log.debug("Activated user: {}", user);
                return user;
            });
    }

    public Optional<User> completePasswordReset(String newPassword, String key) {
        log.debug("Reset user password for reset key {}", key);
        return userRepository
            .findOneByResetKey(key)
            .filter(user -> user.getResetDate().isAfter(Instant.now().minus(1, ChronoUnit.DAYS)))
            .map(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetKey(null);
                user.setResetDate(null);
                this.clearUserCaches(user);
                return user;
            });
    }

    public Optional<User> requestPasswordReset(String mail) {
        return userRepository
            .findOneByEmailIgnoreCase(mail)
            .filter(User::isActivated)
            .map(user -> {
                user.setResetKey(RandomUtil.generateResetKey());
                user.setResetDate(Instant.now());
                this.clearUserCaches(user);
                return user;
            });
    }

    // REGISTER 21. 메소드 실행, 유저 정보와 패스워드 받음
    public User registerUser(AdminUserDTO userDTO, String password) {
        userRepository
            // REGISTER 22. UserRepository의 findOneBylogin 메소드 실행(넘겨 받은 유저 정보 중 로그인 아이디를 소문자로 변환하여 넘김)
            .findOneByLogin(userDTO.getLogin().toLowerCase())
            // REGISTER 23. 로그인 아이디로 아이디를 찾아보고 있다면 실행
            .ifPresent(existingUser -> {
                // REGISTER 24. 찾은 아이디를 파라미터로 removeNonActivatedUser 메소드 실행
                // 해당 아이디가 활성화 상태면 false, 비활성화 상태면 아이디 삭제 후 true
                boolean removed = removeNonActivatedUser(existingUser);
                // REGISTER 32. 활성화 상태면 UsernameAlreadyUsedException 예외
                if (!removed) {
                    throw new UsernameAlreadyUsedException();
                }
            });
        userRepository
            // REGISTER 33. UserRepository의 findOneByEmailIgnoreCase 메소드 실행(이메일을 넘김)
            .findOneByEmailIgnoreCase(userDTO.getEmail())
            // REGISTER 34. 해당 이메일이 존재하면 실행
            .ifPresent(existingUser -> {
                // REGISTER 35. 해당 이메일을 가진 아이디가 활성화 상태면 예외 처리
                boolean removed = removeNonActivatedUser(existingUser);
                if (!removed) {
                    throw new EmailAlreadyUsedException();
                }
            });
        // REGISTER 36. 새로운 유저 객체 생성
        User newUser = new User();
        // REGISTER 37. 패스워드를 암호화
        String encryptedPassword = passwordEncoder.encode(password);
        // REGISTER 38. 새 유저 객체의 아이디를 입력받은 아이디(소문자 변환)로 설정
        newUser.setLogin(userDTO.getLogin().toLowerCase());
        // REGISTER 39. 새 유저 객체의 패스워드를 암호화한 패스워드로 설정
        // new user gets initially a generated password
        newUser.setPassword(encryptedPassword);
        // REGISTER 40. firstname과 lastname 설정
        newUser.setFirstName(userDTO.getFirstName());
        newUser.setLastName(userDTO.getLastName());
        // REGISTER 41. 이메일이 입력 받은 이메일이 null이 아니면 새 유저 객체의 이메이로 설정
        if (userDTO.getEmail() != null) {
            newUser.setEmail(userDTO.getEmail().toLowerCase());
        }
        // REGISTER 42. imageurl, langkey 설정
        newUser.setImageUrl(userDTO.getImageUrl());
        newUser.setLangKey(userDTO.getLangKey());
        // REGISTER 43. 활성/비활성화 상태는 비활성화로 초기화
        // new user is not active
        newUser.setActivated(false);
        // REGISTER 44. 새 유저 객체의 activatekey를 난수로 생성하여 설정
        // new user gets registration key
        newUser.setActivationKey(RandomUtil.generateActivationKey());
        // REGISTER 45. HashSet => 순서대로 입력되지 않고 일정하게 유지되지 않음, null 허용, 중복 허용하지 않음
        // Authority 객체 생성
        Set<Authority> authorities = new HashSet<>();
        // REGISTER 46. ROLE_USER인 권한을 찾고, 있으면 authorities 객체에 해당 권한을 추가 (권한 설정)
        // AuthoritiesConstants.USER : ROLE_USER
        // authorityRepository.findById(AuthoritiesConstants.USER) : Optional[Authority{name='ROLE_USER'}]
        authorityRepository.findById(AuthoritiesConstants.USER).ifPresent(authorities::add);
        // REGISTER 47. 새 유저 객체의 Authorities를 authorities로 설정
        newUser.setAuthorities(authorities);
        // REGISTER 48. UserRepository에 새 유저 객체 저장
        userRepository.save(newUser);
        // REGISTER 49. 새 유저 객체의 캐시 삭제
        this.clearUserCaches(newUser);
        log.debug("Created Information for User: {}", newUser);
        // REGISTER 50. 새 유저 객체 리턴
        return newUser;
    }

    private boolean removeNonActivatedUser(User existingUser) {
        // REGISTER 25. 해당 아이디가 활성화 상태라면 false 리턴
        if (existingUser.isActivated()) {
            return false;
        }
        // REGISTER 26. 비활성화 상태이면 해당 아이디를 삭제
        userRepository.delete(existingUser);
        // REGISTER 27. 버퍼를 삭제
        userRepository.flush();
        // REGISTER 28. 아이디를 파라미터로 clearUserCaches 실행 (캐시 삭제)
        this.clearUserCaches(existingUser);
        // REGISTER 31. true 리턴
        return true;
    }

    public User createUser(AdminUserDTO userDTO) {
        User user = new User();
        user.setLogin(userDTO.getLogin().toLowerCase());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail().toLowerCase());
        }
        user.setImageUrl(userDTO.getImageUrl());
        if (userDTO.getLangKey() == null) {
            user.setLangKey(Constants.DEFAULT_LANGUAGE); // default language
        } else {
            user.setLangKey(userDTO.getLangKey());
        }
        String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
        user.setPassword(encryptedPassword);
        user.setResetKey(RandomUtil.generateResetKey());
        user.setResetDate(Instant.now());
        user.setActivated(true);
        if (userDTO.getAuthorities() != null) {
            Set<Authority> authorities = userDTO
                .getAuthorities()
                .stream()
                .map(authorityRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
            user.setAuthorities(authorities);
        }
        userRepository.save(user);
        this.clearUserCaches(user);
        log.debug("Created Information for User: {}", user);
        return user;
    }

    /**
     * Update all information for a specific user, and return the modified user.
     *
     * @param userDTO user to update.
     * @return updated user.
     */
    // SETTINGS 26. 파라미터로 넘어온 값들을 userDTO 객체로 받아서 실행
    public Optional<AdminUserDTO> updateUser(AdminUserDTO userDTO) {
        return Optional
            // userDTO의 아이디로 유저 정보를 찾음
            .of(userRepository.findById(userDTO.getId()))
            // 존재하는지 확인
            .filter(Optional::isPresent)
            // 존재하면 가져옴
            .map(Optional::get)
            .map(user -> {
                // user의 캐시 삭제
                this.clearUserCaches(user);
                // user의 아이디, firstname, lastname 설정
                user.setLogin(userDTO.getLogin().toLowerCase());
                user.setFirstName(userDTO.getFirstName());
                user.setLastName(userDTO.getLastName());
                // user의 이메일이 없으면
                if (userDTO.getEmail() != null) {
                    // 이메일 설정
                    user.setEmail(userDTO.getEmail().toLowerCase());
                }
                // imageurl, 활성화상태, langkey 설정
                user.setImageUrl(userDTO.getImageUrl());
                user.setActivated(userDTO.isActivated());
                user.setLangKey(userDTO.getLangKey());
                // 권한 정보를 담기 위한 객체 선언 후 user의 권한을 가져와서 할당
                Set<Authority> managedAuthorities = user.getAuthorities();
                // managedAuthorities의 모든 요소 삭제
                managedAuthorities.clear();
                userDTO
                    // 넘어온 유저 객체의 권한 정보를 가져옴
                    .getAuthorities()
                    // 권한 정보들 중
                    .stream()
                    // 넘어온 유저 객체로 authorityRepository에서 권한을 조회하고 
                    .map(authorityRepository::findById)
                    // null이 아닌지 확인
                    .filter(Optional::isPresent)
                    // 가져와서 managedAuthorities에 추가
                    .map(Optional::get)
                    .forEach(managedAuthorities::add);
                // user의 캐시 삭제 후 user를 리턴
                this.clearUserCaches(user);
                log.debug("Changed Information for User: {}", user);
                return user;
            })
            // user를 AdminUserDTO 타입으로 변환해줌
            .map(AdminUserDTO::new);
    }

    public void deleteUser(String login) {
        userRepository
            .findOneByLogin(login)
            .ifPresent(user -> {
                userRepository.delete(user);
                this.clearUserCaches(user);
                log.debug("Deleted User: {}", user);
            });
    }

    /**
     * Update basic information (first name, last name, email, language) for the current user.
     *
     * @param firstName first name of user.
     * @param lastName  last name of user.
     * @param email     email id of user.
     * @param langKey   language key.
     * @param imageUrl  image URL of user.
     */
    public void updateUser(String firstName, String lastName, String email, String langKey, String imageUrl) {
        SecurityUtils
            .getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                if (email != null) {
                    user.setEmail(email.toLowerCase());
                }
                user.setLangKey(langKey);
                user.setImageUrl(imageUrl);
                this.clearUserCaches(user);
                log.debug("Changed Information for User: {}", user);
            });
    }

    // @Transactional이 붙은 메소드는 메소드가 포함한 작업 중 하나라도 실패하면 전체 작업을 취소함
    // 일련의 작업들을 묶어서 하나의 단위로 처리할 때 사용
    @Transactional
    public void changePassword(String currentClearTextPassword, String newPassword) {
        SecurityUtils
            // PASSWORD 21. 현재 로그인한 유저의 아이디를 가져옴
            .getCurrentUserLogin()
            // PASSWORD 22. 현재 로그인한 아이디로 userRepository에서 유저 정보를 찾음
            .flatMap(userRepository::findOneByLogin)
            // PASSWORD 23. 존재하면 실행
            .ifPresent(user -> {
                // PASSWORD 24. 찾아온 유저의 패스워드를 가져와 currentEncryptedPassword 변수에 할당
                String currentEncryptedPassword = user.getPassword();
                // PASSWORD 25. 입력한 현재 패스워드와 찾아온 유저의 패스워드를 비교
                // passwordEncoder.matches() : 평문 패스워드(암호화하지 않은)와 암호화된 패스워도를 비교해줌
                // 같지 않다면 예외 처리하고 종료
                if (!passwordEncoder.matches(currentClearTextPassword, currentEncryptedPassword)) {
                    throw new InvalidPasswordException();
                }
                // PASSWORD 26. 새로운 패스워드를 암호화하여 encryptedPassword 변수에 할당
                String encryptedPassword = passwordEncoder.encode(newPassword);
                // PASSWORD 27. 찾아온 유저의 패스워드를 암호화한 새로운 패스워드로 설정
                user.setPassword(encryptedPassword);
                // PASSWORD 28. user의 캐시 삭제
                this.clearUserCaches(user);
                log.debug("Changed password for User: {}", user);
            });
    }

    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getAllManagedUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(AdminUserDTO::new);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllPublicUsers(Pageable pageable) {
        return userRepository.findAllByIdNotNullAndActivatedIsTrue(pageable).map(UserDTO::new);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneWithAuthoritiesByLogin(login);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthorities() {
        return SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneWithAuthoritiesByLogin);
    }

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p>
     * This is scheduled to get fired everyday, at 01:00 (am).
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        userRepository
            .findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant.now().minus(3, ChronoUnit.DAYS))
            .forEach(user -> {
                log.debug("Deleting not activated user {}", user.getLogin());
                userRepository.delete(user);
                this.clearUserCaches(user);
            });
    }

    /**
     * Gets a list of all the authorities.
     * @return a list of all the authorities.
     */
    @Transactional(readOnly = true)
    public List<String> getAuthorities() {
        return authorityRepository.findAll().stream().map(Authority::getName).collect(Collectors.toList());
    }

    private void clearUserCaches(User user) {
        // REGISTER 29. requireNonNull => Null 체크를 위한 메소드, 파라미터 값이 null이면 NullPointException 발생 / null이 아니면 값을 그대로 반환
        // evict => 데이터 삭제
        // 로그인 캐시에 의한 유저의 값이 null이면 예외 발생, 아니면 값을 리턴
        // 위 결과에서 파라미터로 넘어온 유저의 로그인 아이디 캐시 데이터를 삭제
        Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE)).evict(user.getLogin());
        // REGISTER 30. 유저의 이메일이 null이 아니면 이메일 정보도 위와 같이 처리
        if (user.getEmail() != null) {
            Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE)).evict(user.getEmail());
        }
    }
}
