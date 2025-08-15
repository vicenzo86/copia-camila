import re
from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the registration page
        page.goto("http://127.0.0.1:8080/register", timeout=60000)

        # Wait for the form to be loaded
        form_locator = page.locator("form.space-y-4")
        expect(form_locator).to_be_visible(timeout=15000)

        # Generate a unique email for registration
        unique_email = f"testuser_{int(time.time())}@example.com"
        strong_password = f"Password123!@#_{int(time.time())}"

        # Fill in the registration form with a stronger password
        page.get_by_placeholder("seu@email.com").fill(unique_email)
        page.locator('input[type="password"]').first.fill(strong_password)
        page.locator('input[type="password"]').last.fill(strong_password)

        # Click the register button
        register_button = page.get_by_role("button", name="Cadastrar")
        register_button.click()

        # Check for either a success or an error toast
        success_toast_locator = page.locator("h3:has-text('Cadastro realizado com sucesso')")
        error_toast_locator = page.locator("h3:has-text('Falha no cadastro')")

        # Wait for either of the locators to be visible
        expect(success_toast_locator.or_(error_toast_locator)).to_be_visible(timeout=15000)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/registration_attempt.png")

        # Assert that the success toast is visible
        expect(success_toast_locator).to_be_visible()

        print("Verification script ran successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/registration_error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
