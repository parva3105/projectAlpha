import { Html, Head, Body, Container, Heading, Text, Preview } from '@react-email/components'

interface Props {
  creatorName: string
}

export default function PartnershipAcceptedEmail({ creatorName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{creatorName} accepted your partnership request</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ padding: '40px 20px', maxWidth: '560px', margin: '0 auto' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>
            Creator accepted your partnership request
          </Heading>
          <Text style={{ color: '#6b7280' }}>
            <strong>{creatorName}</strong> has accepted your partnership request and is now on your
            creator roster.
          </Text>
          <Text style={{ color: '#6b7280' }}>
            Log in to your agency portal to start assigning brand deals to them.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
