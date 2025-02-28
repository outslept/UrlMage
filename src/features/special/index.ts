import { SpecialSiteManager } from './base/manager'
import { DiscordHandler } from './sites/discord'
import { GitHubHandler } from './sites/github'
import { MailHandler } from './sites/mail'
import { PlayMarketHandler } from './sites/playmarket'
import { SpotifyHandler } from './sites/spotify'
import { SteamHandler } from './sites/steam'
import { TelegramHandler } from './sites/telegram'
import { WhatsAppHandler } from './sites/whatsapp'

// Create and configure the manager
const specialSiteManager = new SpecialSiteManager()

// Register all handlers
specialSiteManager.register(new DiscordHandler())
specialSiteManager.register(new GitHubHandler())
specialSiteManager.register(new SpotifyHandler())
specialSiteManager.register(new SteamHandler())
specialSiteManager.register(new TelegramHandler())
specialSiteManager.register(new WhatsAppHandler())
specialSiteManager.register(new PlayMarketHandler())
specialSiteManager.register(new MailHandler())

export { specialSiteManager }

// Export base types
export * from './base/types'

// Export site-specific modules
export * from './sites/discord'
export * from './sites/github'
export * from './sites/mail'
export * from './sites/playmarket'
export * from './sites/spotify'
export * from './sites/steam'
export * from './sites/telegram'
export * from './sites/whatsapp'
