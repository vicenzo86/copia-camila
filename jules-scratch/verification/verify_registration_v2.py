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

        # Fill in the registration form using more robust selectors
        page.get_by_placeholder("seu@email.com").fill(unique_email)
        page.locator('input[type="password"]').first.fill("password123")
        page.locator('input[type="password"]').last.fill("password123")

        # Click the register button
        register_button = page.get_by_role("button", name="Cadastrar")
        register_button.click()

        # Wait for the success toast to appear by looking for its title
        # Based on toast.tsx, ToastTitle renders a primitive which is likely a heading.
        # Let's try to find the toast by the text of the title.
        success_toast_title = page.locator("div[role='status']").locator("h3:has-text('Cadastro realizado com sucesso')")
        expect(success_toast_title).to_be_visible(timeout=15000)

        # Take a screenshot of the page with the success message
        page.screenshot(path="jules-scratch/verification/registration_success.png")

        print("Verification script ran successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/registration_error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
