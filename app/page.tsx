'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Relay, Event as NostrEvent } from 'nostr-tools'

const EventCard = ({ event }: { event: NostrEvent }) => (
  <Card className="h-full flex flex-col">
    <CardHeader>
      <CardTitle>{event.pubkey}</CardTitle>
      {/* <CardDescription>{event.description}</CardDescription> */}
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
        <span>{event.content}</span>
      </div>
    </CardContent>
    <CardFooter>
      <Badge variant="secondary">{event.created_at}</Badge>
    </CardFooter>
  </Card>
)

export default function EventsPage() {
  const [events, setEvents] = useState<NostrEvent[]>([])

  useEffect(() => {
    const connectRelay = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_NOSTR_RELAY_URL) {
          console.warn('NEXT_PUBLIC_NOSTR_RELAY_URL is not set. Using default relay URL.')
        }
        // TODO: Chheck if this works. If not, find another way to dynamically set the relay URL
        const relayUrl = process.env.NEXT_PUBLIC_NOSTR_RELAY_URL || 'wss://relay-openelect.example'
        const relay = await Relay.connect(relayUrl)
        console.log(`Connected to ${relay.url}`)

        const sub = relay.subscribe([
          {
            kinds: [1], // Assuming events are kind 1, adjust if needed
            // limit: 20 // Limit to 20 most recent events
          },
        ], {
          onevent(nostrEvent) {
            setEvents(prevEvents => [...prevEvents, nostrEvent])
          },
          oneose() {
            sub.close()
          }
        })

        return () => {
          sub.close()
          relay.close()
        }
      } catch (error) {
        console.error('Failed to connect to relay:', error)
      }
    }

    connectRelay()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Latest Events</h1>
      {events.length === 0 ? (
        <p className="text-center text-muted-foreground">Loading events...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

