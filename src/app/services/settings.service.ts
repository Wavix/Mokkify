class SettingsService {
  public async getLastVersion(): Promise<string | null> {
    try {
      const response = await fetch("https://raw.githubusercontent.com/Wavix/Mokkify/main/package.json")
      const data = await response.json()

      return data.version
    } catch {
      return null
    }
  }
}

export { SettingsService }
