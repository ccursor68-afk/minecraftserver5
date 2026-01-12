'use client'

import Link from 'next/link'
import { Check, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const { t } = useLanguage()
  const router = useRouter()

  const handlePurchase = (packageName) => {
    router.push(`/tickets/create?category=purchase&package=${packageName}`)
  }

  const plans = [
    {
      name: t('pricing.free'),
      price: '0 TL',
      description: t('pricing.freeDesc'),
      features: [
        { text: t('pricing.standardListing'), included: true },
        { text: t('pricing.coloredBanner'), included: true },
        { text: t('pricing.betweenBanner'), included: true },
        { text: t('pricing.visitorCounter'), included: true },
        { text: t('pricing.maxLabels'), included: true },
        { text: t('pricing.noColoredBanner'), included: false },
        { text: t('pricing.noQualityBanner'), included: false },
        { text: t('pricing.noAds'), included: false }
      ],
      buttonText: t('pricing.getStarted'),
      buttonClass: 'border-gray-700 hover:border-green-500',
      packageId: 'free'
    },
    {
      name: t('pricing.silver'),
      price: '79 TL',
      description: t('pricing.silverDesc'),
      popular: false,
      features: [
        { text: t('pricing.priorityListing'), included: true },
        { text: t('pricing.topBanner'), included: true },
        { text: t('pricing.qualityBanner'), included: true },
        { text: t('pricing.fastBump'), included: true },
        { text: t('pricing.discordWebhook'), included: true },
        { text: t('pricing.noQualityBanner'), included: false },
        { text: t('pricing.advancedPanel'), included: false },
        { text: t('pricing.noDelayAds'), included: false }
      ],
      buttonText: t('pricing.buyNow'),
      buttonClass: 'bg-gray-700 hover:bg-gray-600 text-white',
      packageId: 'silver'
    },
    {
      name: t('pricing.gold'),
      price: '199 TL',
      description: t('pricing.goldDesc'),
      popular: true,
      badge: t('pricing.goldBadge'),
      features: [
        { text: t('pricing.topBanner'), included: true },
        { text: t('pricing.featuredBanner'), included: true },
        { text: t('pricing.qualityBanner'), included: true },
        { text: t('pricing.fastBump'), included: true },
        { text: t('pricing.featuredFavicon'), included: true },
        { text: t('pricing.advancedPanel'), included: true },
        { text: t('pricing.noDelayAds'), included: true }
      ],
      buttonText: t('pricing.buyNow'),
      buttonClass: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white',
      packageId: 'gold'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0f0f0f]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="ServerListRank" className="w-11 h-11 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-green-500">ServerListRank</h1>
              <p className="text-xs text-gray-400">{t('pricing.title')}</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            {t('pricing.subtitle')}
          </h2>
          <p className="text-xl text-gray-400 mb-4">
            {t('pricing.description')}
          </p>
          <Badge className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 text-sm">
            {t('pricing.firstMonth')}
          </Badge>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden ${
                  plan.popular
                    ? 'bg-gradient-to-b from-yellow-900/20 to-[#0f0f0f] border-yellow-600 shadow-lg shadow-yellow-600/20 scale-105'
                    : 'bg-[#0f0f0f] border-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-600 to-orange-600 px-4 py-1 text-xs font-bold text-black">
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== '0 TL' && (
                        <span className="text-gray-400">{t('pricing.perMonth')}</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-gray-200' : 'text-gray-500'}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePurchase(plan.packageId)}
                    className={`w-full ${plan.buttonClass}`}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Sunucunuzu Büyütmeye Hazır mısınız?
          </h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Binlerce oyuncuya ulaşın ve sunucunuzu Minecraft'ın en popüler sunucuları arasına taşıyın.
          </p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700" size="lg">
              Hemen Başla
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
