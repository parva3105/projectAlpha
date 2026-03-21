import { Html, Head, Body, Container, Heading, Text, Preview } from '@react-email/components'

interface Props {
  creatorName: string
}

export default function PartnershipDeclinedEmail({ creatorName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{creatorName} declined your partnership request</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ padding: '40px 20px', maxWidth: '560px', margin: '0 auto' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>
            Creator declined your partnership request
          </Heading>
          <Text style={{ color: '#6b7280' }}>
            <strong>{creatorName}</strong> has declined your partnership request.
          </Text>
          <Text style={{ color: '#6b7280' }}>
            You can reach out through other channels or send a new request at a later time from
            the creator directory.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
