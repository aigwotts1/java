package com.quickdevbase.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class InputValidationTest {
    @Test
    void normalizesIdentityFields() {
        assertEquals("Ada Lovelace", InputValidation.validName("  Ada   Lovelace "));
        assertEquals("ada@example.com", InputValidation.validEmail(" ADA@Example.COM "));
        assertEquals("strong-pass", InputValidation.validPassword("strong-pass"));
    }

    @Test
    void rejectsMalformedRegistrationFields() {
        assertThrows(InputValidation.InvalidInputException.class, () -> InputValidation.validName("A"));
        assertThrows(InputValidation.InvalidInputException.class, () -> InputValidation.validEmail("bad"));
        assertThrows(InputValidation.InvalidInputException.class, () -> InputValidation.validPassword("short"));
    }
}
