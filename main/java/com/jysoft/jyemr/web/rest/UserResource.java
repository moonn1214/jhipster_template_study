package com.jysoft.jyemr.web.rest;

import com.jysoft.jyemr.config.Constants;
import com.jysoft.jyemr.domain.User;
import com.jysoft.jyemr.repository.UserRepository;
import com.jysoft.jyemr.security.AuthoritiesConstants;
import com.jysoft.jyemr.service.MailService;
import com.jysoft.jyemr.service.UserService;
import com.jysoft.jyemr.service.dto.AdminUserDTO;
import com.jysoft.jyemr.web.rest.errors.BadRequestAlertException;
import com.jysoft.jyemr.web.rest.errors.EmailAlreadyUsedException;
import com.jysoft.jyemr.web.rest.errors.LoginAlreadyUsedException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;
import java.util.Collections;
import javax.validation.Valid;
import javax.validation.constraints.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing users.
 * <p>
 * This class accesses the {@link User} entity, and needs to fetch its collection of authorities.
 * <p>
 * For a normal use-case, it would be better to have an eager relationship between User and Authority,
 * and send everything to the client side: there would be no View Model and DTO, a lot less code, and an outer-join
 * which would be good for performance.
 * <p>
 * We use a View Model and a DTO for 3 reasons:
 * <ul>
 * <li>We want to keep a lazy association between the user and the authorities, because people will
 * quite often do relationships with the user, and we don't want them to get the authorities all
 * the time for nothing (for performance reasons). This is the #1 goal: we should not impact our users'
 * application because of this use-case.</li>
 * <li> Not having an outer join causes n+1 requests to the database. This is not a real issue as
 * we have by default a second-level cache. This means on the first HTTP call we do the n+1 requests,
 * but then all authorities come from the cache, so in fact it's much better than doing an outer join
 * (which will get lots of data from the database, for each HTTP call).</li>
 * <li> As this manages users, for security reasons, we'd rather have a DTO layer.</li>
 * </ul>
 * <p>
 * Another option would be to have a specific JPA entity graph to handle this case.
 */
@RestController
@RequestMapping("/api/admin")
public class UserResource {

    private static final List<String> ALLOWED_ORDERED_PROPERTIES = Collections.unmodifiableList(
        Arrays.asList(
            "id",
            "login",
            "firstName",
            "lastName",
            "email",
            "activated",
            "langKey",
            "createdBy",
            "createdDate",
            "lastModifiedBy",
            "lastModifiedDate"
        )
    );

    private final Logger log = LoggerFactory.getLogger(UserResource.class);

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserService userService;

    private final UserRepository userRepository;

    private final MailService mailService;

    public UserResource(UserService userService, UserRepository userRepository, MailService mailService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.mailService = mailService;
    }

    /**
     * {@code POST  /admin/users}  : Creates a new user.
     * <p>
     * Creates a new user if the login and email are not already used, and sends an
     * mail with an activation link.
     * The user needs to be activated on creation.
     *
     * @param userDTO the user to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new user, or with status {@code 400 (Bad Request)} if the login or email is already in use.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     * @throws BadRequestAlertException {@code 400 (Bad Request)} if the login or email is already in use.
     */
    @PostMapping("/users")
    // MANAGEMENT-NEW 22. 권한이 admin 일 때만 실행
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    // MANAGEMENT-NEW 23. RequestBody로 넘겨 받은 파라미터(새로 작성된 유저 정보)를 AdminUserDTO 타입으로 받고 Valid로 검증
    // @RequestBody : 클라이언트가 전송하는 HttpBody를 Java 객체로 변환시킴
    public ResponseEntity<User> createUser(@Valid @RequestBody AdminUserDTO userDTO) throws URISyntaxException {
        log.debug("REST request to save User : {}", userDTO);

        // MANAGEMENT-NEW 24. 넘겨 받은 유저의 아이디(넘버)가 null이 아니면 이미 있는 유저로 예외 처리
        if (userDTO.getId() != null) {
            throw new BadRequestAlertException("A new user cannot already have an ID", "userManagement", "idexists");
            // Lowercase the user login before comparing with database
        } 
        // MANAGEMENT-NEW 25. 넘겨 받은 유저의 로그인아이디로가 이미 존재하면 예외 처리
        else if (userRepository.findOneByLogin(userDTO.getLogin().toLowerCase()).isPresent()) {
            throw new LoginAlreadyUsedException();
        } 
        // MANAGEMENT-NEW 26. 이메일 예외 처리
        else if (userRepository.findOneByEmailIgnoreCase(userDTO.getEmail()).isPresent()) {
            throw new EmailAlreadyUsedException();
        } else {
            // MANAGEMENT-NEW 27. 존재하지 않으면 넘겨 받은 유저를 파라미터로 createUser 메소드 실행(UserService.java)
            // MANAGEMENT-NEW 36. 설정이 완료된 유저 객체를 반환 받아서 newUser에 할당
            User newUser = userService.createUser(userDTO);
            // MANAGEMENT-NEW 37. newUser를 파라미터로 메소드 실행(MailService.java)
            mailService.sendCreationEmail(newUser);
            // MANAGEMENT-NEW 39. 응답 객체 생성, 새로운 유저의 로그인아이디를 포함한 uri 생성, 헤더에 alert 생성, body에 새 유저 객체를 담아 리턴
            return ResponseEntity
                .created(new URI("/api/admin/users/" + newUser.getLogin()))
                .headers(
                    HeaderUtil.createAlert(applicationName, "A user is created with identifier " + newUser.getLogin(), newUser.getLogin())
                )
                .body(newUser);
        }
    }

    /**
     * {@code PUT /admin/users} : Updates an existing User.
     *
     * @param userDTO the user to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated user.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already in use.
     * @throws LoginAlreadyUsedException {@code 400 (Bad Request)} if the login is already in use.
     */
    @PutMapping("/users")
    // MANAGEMENT 39. MANAGEMENT-EDIT 23. 권한이 admin일 때만 실행
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    // MANAGEMENT 40. MANAGEMENT-EDIT 24. 요청 파라미터로 넘어온 user 정보를 AdminUserDTO 타입으로 변환하여 생성 및 검증
    public ResponseEntity<AdminUserDTO> updateUser(@Valid @RequestBody AdminUserDTO userDTO) {
        log.debug("REST request to update User : {}", userDTO);
        // MANAGEMENT 41. 유저의 이메일로 유저를 찾음
        // findOneByEmailIgnoreCase(userDTO.getEmail()) : Optional[User{login='jkmoon', firstName='JongKug', lastName='Moon', email='jkmoon@jyoungsoft.com', imageUrl='null', activated='true', langKey='en', activationKey='KKph0LVWu26rOG5Qb9nq'}]
        Optional<User> existingUser = userRepository.findOneByEmailIgnoreCase(userDTO.getEmail());
        // MANAGEMENT 42. 찾은 유저가 존재하고
        //                찾은 유저의 아이디와 넘어온 유저의 아이디가 동일하지 않으면
        //                예외 처리하고 종료
        if (existingUser.isPresent() && (!existingUser.get().getId().equals(userDTO.getId()))) {
            throw new EmailAlreadyUsedException();
        }
        // MANAGEMENT 43. 넘어온 유저의 로그인 아이디(소문자변환)로 유저를 찾음, 위와 같이 처리
        // findOneByLogin(userDTO.getLogin().toLowerCase()) : Optional[User{login='jkmoon', firstName='JongKug', lastName='Moon', email='jkmoon@jyoungsoft.com', imageUrl='null', activated='true', langKey='en', activationKey='KKph0LVWu26rOG5Qb9nq'}]
        existingUser = userRepository.findOneByLogin(userDTO.getLogin().toLowerCase());
        if (existingUser.isPresent() && (!existingUser.get().getId().equals(userDTO.getId()))) {
            throw new LoginAlreadyUsedException();
        }
        // MANAGEMENT 44. 넘어온 유저의 정보를 파라미터로 UserService의 updateUser메소드 실행
        // 새로 설정한 유저 정보를 updatedUser에 할당
        Optional<AdminUserDTO> updatedUser = userService.updateUser(userDTO);

        // MANAGEMENT 45. MANAGEMENT-EDIT 25. 
        // ResponseUtil.wrapOrNotFound : httpstatus.ok 상태로 responseEntity로 래핑, 비어있으면 httpstatus.not_found 상태로 예외 처리
        // updatedUser를 응답 body에 넣음
        // 헤더로 alert 생성(applicationName, 문자열, 로그인 아이디)
        return ResponseUtil.wrapOrNotFound(
            updatedUser,
            HeaderUtil.createAlert(applicationName, "A user is updated with identifier " + userDTO.getLogin(), userDTO.getLogin())
        );
    }

    /**
     * {@code GET /admin/users} : get all users with all the details - calling this are only allowed for the administrators.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body all users.
     */
    // MANAGEMENT 14. user-management.reducer.ts에서 get 방식 요청을 보냄
    @GetMapping("/users")
    // @preAuthorize : 안의 조건을 만족하면 invoke 시킴, 즉 조건식 true일 때만 메소드 실행
    // 권한이 admin일 때 실행
    // pageable => Page request [number: 0, size 20, sort: id: ASC]
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers(@org.springdoc.api.annotations.ParameterObject Pageable pageable) {
        log.debug("REST request to get all User for an admin");
        // MANAGEMENT 15. 요청 파라미터를 입력 파라미터로 하여 onlyContainsAllowedProperties 메소드 실행
        if (!onlyContainsAllowedProperties(pageable)) {
            // MANAGEMENT 17. 하나라도 일치하지 않으면 badRequest 리턴
            return ResponseEntity.badRequest().build();
        }

        // MANAGEMENT 18. UserService의 pageable을 파라미터로 하여 getAllManagedUsers 메소드 실행
        // MANAGEMENT 20. 유저 객체들을 리턴받아 page에 할당
        final Page<AdminUserDTO> page = userService.getAllManagedUsers(pageable);
        // MANAGEMENT 21. 응답 헤더를 생성
        // ServletUriComponentsBuilder : 특정한 값을 포함한 uri를 전달할 때 사용
        // fromCurrentRequest() : 현재 요청된 request 값을 사용
        // 사용자가 요청한 uri와 유저 객체들을 담고 있는 page를 넣음
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        // MANAGEMENT 22. 응답 body에 page의 내용, 헤더에 headers, status에 200을 담아 리턴
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    private boolean onlyContainsAllowedProperties(Pageable pageable) {
        // MANAGEMENT 16. 파라미터의 sort를 가져옴
        // Sort domain의 order 방식을 가져옴
        // 정렬하기 위한 속성을 나열함
        // 모든 나열된 속성의 형태가 ALLOWED_ORDERED_PROPERTIES 형태와 일치하는지 검사하고 결과 리턴
        return pageable.getSort().stream().map(Sort.Order::getProperty).allMatch(ALLOWED_ORDERED_PROPERTIES::contains);
    }

    /**
     * {@code GET /admin/users/:login} : get the "login" user.
     *
     * @param login the login of the user to find.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the "login" user, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/users/{login}")
    // MANAGEMENT-DETAIL 8. 권한이 admin일 때만 메소드 실행
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    // MANAGEMENT-DETAIL 9. Pattern으로 로그인 아이디가 로그인 정규식 패턴에 적합한지 검사하고
    // url 파라미터로 전달받은 value인 login을 PathVariable로 메서드의 파라미터로 받음
    public ResponseEntity<AdminUserDTO> getUser(@PathVariable @Pattern(regexp = Constants.LOGIN_REGEX) String login) {
        log.debug("REST request to get User : {}", login);
        // MANAGEMENT-DETAIL 10. 로그인 아이디를 파라미터로 UserService의 메소드로 권한이 있는 유저를 찾아서 AdminUserDTO 타입의 객체로 생성 후 200번 코드와 함께 리턴
        return ResponseUtil.wrapOrNotFound(userService.getUserWithAuthoritiesByLogin(login).map(AdminUserDTO::new));
    }

    /**
     * {@code DELETE /admin/users/:login} : delete the "login" User.
     *
     * @param login the login of the user to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/users/{login}")
    // MANAGEMENT-DELETE 20. 권한이 admin일 때만 실행
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    // MANAGEMENT-DELETE 21. 요청 url의 파라미터로 전달받은 값인 login의 패턴을 검증하고 메소드의 파라미터로 받을 수 있게 함
    public ResponseEntity<Void> deleteUser(@PathVariable @Pattern(regexp = Constants.LOGIN_REGEX) String login) {
        log.debug("REST request to delete User: {}", login);
        // MANAGEMENT-DELETE 22. 로그인 아이디를 파라미터로 deleteUser 메소드 실행(UserService.java)
        userService.deleteUser(login);
        // MANAGEMENT-DELETE 24. 응답 header에 아래 내용을 담아 리턴 
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createAlert(applicationName, "A user is deleted with identifier " + login, login))
            .build();
    }
}
