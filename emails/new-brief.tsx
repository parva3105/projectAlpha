import { Html, Head, Body, Container, Heading, Text, Preview } from '@react-email/components'

interface Props {
  brandName: string
  campaignName: string
}

export default function NewBriefEmail({ brandName, campaignName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>New brief submitted: &quot;{campaignName}&quot;</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ padding: '40px 20px', maxWidth: '560px', margin: '0 auto' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>New brief submitted</Heading>
          <Text style={{ color: '#6b7280' }}>
            A new campaign brief <strong>&quot;{campaignName}&quot;</strong> has been submitted by{' '}
            <strong>{brandName}</strong>.
          </Text>
          <Text style={{ color: '#6b7280' }}>
            Log in to your agency portal to review the brief details and assign a creator or
            convert it into an active deal.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
