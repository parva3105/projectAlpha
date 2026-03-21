import { Html, Head, Body, Container, Heading, Text, Preview } from '@react-email/components'

interface Props {
  dealTitle: string
  creatorName: string
}

export default function ContentApprovedEmail({ dealTitle, creatorName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your content was approved for &quot;{dealTitle}&quot;</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ padding: '40px 20px', maxWidth: '560px', margin: '0 auto' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>Your content was approved!</Heading>
          <Text style={{ color: '#6b7280' }}>Hi {creatorName},</Text>
          <Text style={{ color: '#6b7280' }}>
            Great news! Your content submission for <strong>&quot;{dealTitle}&quot;</strong> has been
            approved. The deal will now move to the next stage.
          </Text>
          <Text style={{ color: '#6b7280' }}>
            Log in to your creator portal to track the deal progress and upcoming payment.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
