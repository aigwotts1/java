package com.quickdevbase.user;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

import org.bouncycastle.crypto.generators.SCrypt;
import org.springframework.security.crypto.scrypt.SCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {
    private static final int LEGACY_CPU_COST = 16_384;
    private static final int LEGACY_MEMORY_COST = 8;
    private static final int LEGACY_PARALLELIZATION = 1;
    private static final int LEGACY_KEY_LENGTH = 64;

    private final SCryptPasswordEncoder encoder = SCryptPasswordEncoder.defaultsForSpringSecurity_v5_8();

    public String hash(String password) {
        return encoder.encode(password);
    }

    public boolean matches(String password, String stored) {
        if (password == null || stored == null) return false;
        if (stored.startsWith("scrypt:")) return matchesLegacy(password, stored);
        try {
            return encoder.matches(password, stored);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    public boolean needsUpgrade(String stored) {
        return stored != null && (stored.startsWith("scrypt:") || encoder.upgradeEncoding(stored));
    }

    private boolean matchesLegacy(String password, String stored) {
        String[] fields = stored.split(":", 3);
        if (fields.length != 3) return false;
        try {
            // The former Node backend passed the hexadecimal salt text itself to crypto.scrypt.
            // Preserve those exact bytes so existing users can log in and be rehashed.
            byte[] salt = fields[1].getBytes(StandardCharsets.UTF_8);
            byte[] expected = HexFormat.of().parseHex(fields[2]);
            byte[] actual = SCrypt.generate(
                password.getBytes(StandardCharsets.UTF_8),
                salt,
                LEGACY_CPU_COST,
                LEGACY_MEMORY_COST,
                LEGACY_PARALLELIZATION,
                LEGACY_KEY_LENGTH
            );
            return MessageDigest.isEqual(actual, expected);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }
}
