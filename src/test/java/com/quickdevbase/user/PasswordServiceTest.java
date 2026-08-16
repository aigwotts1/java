package com.quickdevbase.user;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class PasswordServiceTest {
    private final PasswordService passwords = new PasswordService();

    @Test
    void createsSaltedSpringScryptHashes() {
        String first = passwords.hash("LearnJava!42");
        String second = passwords.hash("LearnJava!42");

        assertNotEquals(first, second);
        assertTrue(passwords.matches("LearnJava!42", first));
        assertFalse(passwords.matches("wrong-password", first));
    }

    @Test
    void acceptsAndFlagsLegacyNodeScryptHashesForUpgrade() {
        String legacy = "scrypt:00112233445566778899aabbccddeeff:"
            + "a1711aa6ea5a7f6043bf0ce0e18075646c21aefc88e9347d60f3b5bb25cc2086"
            + "d6673ca1fa9f7589b5fa4b77706a8d443255c6a6a42e6e347ce3a2703d9cd7f6";

        assertTrue(passwords.matches("LegacyPass!42", legacy));
        assertFalse(passwords.matches("not-it", legacy));
        assertTrue(passwords.needsUpgrade(legacy));
    }
}
