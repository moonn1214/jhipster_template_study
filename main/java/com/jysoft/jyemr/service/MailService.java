package com.jysoft.jyemr.service;

import com.jysoft.jyemr.domain.User;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;
import tech.jhipster.config.JHipsterProperties;

/**
 * Service for sending emails.
 * <p>
 * We use the {@link Async} annotation to send emails asynchronously.
 */
@Service
public class MailService {

    private final Logger log = LoggerFactory.getLogger(MailService.class);

    private static final String USER = "user";

    private static final String BASE_URL = "baseUrl";

    private final JHipsterProperties jHipsterProperties;

    private final JavaMailSender javaMailSender;

    private final MessageSource messageSource;

    private final SpringTemplateEngine templateEngine;

    public MailService(
        JHipsterProperties jHipsterProperties,
        JavaMailSender javaMailSender,
        MessageSource messageSource,
        SpringTemplateEngine templateEngine
    ) {
        this.jHipsterProperties = jHipsterProperties;
        this.javaMailSender = javaMailSender;
        this.messageSource = messageSource;
        this.templateEngine = templateEngine;
    }

    @Async
    public void sendEmail(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        log.debug(
            "Send email[multipart '{}' and html '{}'] to '{}' with subject '{}' and content={}",
            isMultipart,
            isHtml,
            to,
            subject,
            content
        );

        // Prepare message using a Spring helper
        // REGISTER 62. MimeMessage 객체 생성(메일 발송을 위해)
        // javaMaileSender(파일 첨부 또는 html로 구성되어 있을 경우 사용)의 createMimeMessage 메소드를 사용하여 생성
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            // REGISTER 63. MimeMessageHelper 객체 생성 (MimeMessage를 쉽게 생성하기 위해)
            // mimeMessage객체(메세지 작성을 당하는 객체), 멀티파트 여부, utf-8 인코딩 방식을 사용
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, isMultipart, StandardCharsets.UTF_8.name());
            // REGISTER 64. 받는 사람을 새 유저 객체로 설정
            message.setTo(to);
            // REGISTER 65. 보내는 사람을 설정 (jhipster 내부 설정인 듯)
            message.setFrom(jHipsterProperties.getMail().getFrom());
            // REGISTER 66. 제목 설정
            message.setSubject(subject);
            // REGISTER 67. 본문 설정, html 여부 활용
            message.setText(content, isHtml);
            // REGISTER 68. mimeMessage를 전송
            javaMailSender.send(mimeMessage);
            log.debug("Sent email to User '{}'", to);
        } catch (MailException | MessagingException e) {
            // REGISTER 69. 예외 발생 시 처리
            log.warn("Email could not be sent to user '{}'", to, e);
        }
    }

    @Async
    public void sendEmailFromTemplate(User user, String templateName, String titleKey) {
        // REGISTER 54. 새 유저의 이메일이 없으면 로그 찍고 종료
        if (user.getEmail() == null) {
            log.debug("Email doesn't exist for user '{}'", user.getLogin());
            return;
        }
        // REGISTER 55. 새 유저 객체의 langkey를 locale에 할당
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        // REGISTER 56. Context => 어떤 행위(메소드 등)를 위한 정보
        // locale로 context 객체 생성
        Context context = new Context(locale);
        // REGISTER 57. context에 USER라는 name의 변수에 새 유저 객체 설정
        context.setVariable(USER, user);
        // REGISTER 58. context에 BASE_URL이라는 name의 변수에 baseUrl 설정
        // baseUrl => http://127.0.0.1:8080 # 이메일 내부에 사용되는 애플리케이션 URL (이메일 보내는 주소인 듯)
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        // REGISTER 59. content(본문 내용)에 templateName과 context로 타임리프 템플릿엔진을 사용해 만든 내용을 할당
        String content = templateEngine.process(templateName, context);
        // REGISTER 60. subject(제목)에 titleKey와 locale로 설정한 메시지를 가져와서 할당
        String subject = messageSource.getMessage(titleKey, null, locale);
        // REGISTER 61. 새 유저의 이메일, 제목, 본문, isMultipart(데이터를 여러 부분 나눠서 전송하는지) false, isHtml true를 파라미터로 sendEmail 메소드 실행
        sendEmail(user.getEmail(), subject, content, false, true);
    }

    @Async
    public void sendActivationEmail(User user) {
        log.debug("Sending activation email to '{}'", user.getEmail());
        // REGISTER 53. sendEmailFromTemplate 메소드 실행 (새 유저 객체와 templatename, titlekey를 파라미터로 넘김)
        sendEmailFromTemplate(user, "mail/activationEmail", "email.activation.title");
    }

    @Async
    public void sendCreationEmail(User user) {
        log.debug("Sending creation email to '{}'", user.getEmail());
        // MANAGEMENT-NEW 38. sendEmailFromTemplate 실행
        sendEmailFromTemplate(user, "mail/creationEmail", "email.activation.title");
    }

    @Async
    public void sendPasswordResetMail(User user) {
        log.debug("Sending password reset email to '{}'", user.getEmail());
        // REQUEST 17. 파라미터들을 넘겨주며 해당 메소드 실행, 메일을 보냄(resetkey를 포함하여 보냄)
        sendEmailFromTemplate(user, "mail/passwordResetEmail", "email.reset.title");
    }
}
