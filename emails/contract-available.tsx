import { Html, Body, Text, Heading, Container, Hr, Preview } from '@react-email/components'

interface Props {
  dealTitle: string
  creatorName: string
}

export default function ContractAvailableEmail({ dealTitle, creatorName }: Props) {
  return (
    <Html>
      <Preview>Your contract for &quot;{dealTitle}&quot; is ready</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', maxWidth: '480px' }}>
          <Heading style={{ fontSize: '20px', marginBottom: '8px' }}>Contract ready for review</Heading>
          <Hr />
          <Text>Hi {creatorName},</Text>
          <Text>
            Your contract for <strong>&quot;{dealTitle}&quot;</strong> has been sent. Please review and sign it to proceed.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
