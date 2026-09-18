class LoginScreen {
  get menuButton() {
    return $('~open menu');
  }
  get loginMenuItem() {
    return $('~menu item log in');
  }
  get username() {
    return $('~Username input field');
  }
  get password() {
    return $('~Password input field');
  }
  get loginButton() {
    return $('~Login button');
  }

  async open() {
    await this.menuButton.click();
    await this.loginMenuItem.click();
    await this.username.waitForDisplayed({ timeout: 10_000 });
  }

  async login(user, pass) {
    await this.username.setValue(user);
    await this.password.setValue(pass);
    await driver.hideKeyboard(); // the keyboard often covers the button!
    await this.loginButton.click();
  }
}

export default new LoginScreen();
