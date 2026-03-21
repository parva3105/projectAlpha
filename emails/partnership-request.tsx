import { Html, Head, Body, Container, Heading, Text, Preview } from '@react-email/components'

interface Props {
  creatorName: string
  agencyName?: string
}

export default function PartnershipRequestEmail({ creatorName, agencyName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Partnership request from {agencyName ?? 'an agency'}</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ padding: '40px 20px', maxWidth: '560px', margin: '0 auto' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>
            Partnership request from an agency
          </Heading>
          <Text style={{ color: '#6b7280' }}>Hi {creatorName},</Text>
          <Text style={{ color: '#6b7280' }}>
            {agencyName ?? 'An agency'} has sent you a partnership request on Brand Deal Manager.
            Accepting this request will add you to their creator roster and allow them to manage
            brand deals on your behalf.
          </Text>
          <Text style={{ color: '#6b7280' }}>
            Log in to your creator portal to review and respond to this request.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
