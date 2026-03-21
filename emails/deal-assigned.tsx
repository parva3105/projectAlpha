import { Html, Body, Text, Heading, Container, Hr, Preview } from '@react-email/components'

interface Props {
  dealTitle: string
  creatorName: string
  agencyName?: string
}

export default function DealAssignedEmail({ dealTitle, creatorName, agencyName = 'Your agency' }: Props) {
  return (
    <Html>
      <Preview>You&apos;ve been assigned to a new deal: {dealTitle}</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', maxWidth: '480px' }}>
          <Heading style={{ fontSize: '20px', marginBottom: '8px' }}>New deal assigned</Heading>
          <Hr />
          <Text>Hi {creatorName},</Text>
          <Text>
            {agencyName} has assigned you to <strong>&quot;{dealTitle}&quot;</strong>. Log in to your creator portal to view the deal details.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
