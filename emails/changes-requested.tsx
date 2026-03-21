import { Html, Head, Body, Container, Heading, Text, Preview } from '@react-email/components'

interface Props {
  dealTitle: string
  creatorName: string
  feedback?: string
}

export default function ChangesRequestedEmail({ dealTitle, creatorName, feedback }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Changes requested on your submission for &quot;{dealTitle}&quot;</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ padding: '40px 20px', maxWidth: '560px', margin: '0 auto' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>Changes requested</Heading>
          <Text style={{ color: '#6b7280' }}>Hi {creatorName},</Text>
          <Text style={{ color: '#6b7280' }}>
            Your submission for <strong>&quot;{dealTitle}&quot;</strong> requires changes before it
            can be approved. Please review the feedback below and resubmit.
          </Text>
          {feedback ? (
            <Text
              style={{
                color: '#374151',
                backgroundColor: '#f3f4f6',
                padding: '16px',
                borderRadius: '6px',
                borderLeft: '4px solid #d1d5db',
              }}
            >
              {feedback}
            </Text>
          ) : null}
          <Text style={{ color: '#6b7280' }}>
            Log in to your creator portal to view the full details and submit a revised version.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
