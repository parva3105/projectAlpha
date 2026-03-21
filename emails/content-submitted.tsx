import { Html, Body, Text, Heading, Container, Hr, Preview } from '@react-email/components'

interface Props {
  dealTitle: string
  creatorName: string
  round: number
}

export default function ContentSubmittedEmail({ dealTitle, creatorName, round }: Props) {
  return (
    <Html>
      <Preview>New content submitted for &quot;{dealTitle}&quot;</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', maxWidth: '480px' }}>
          <Heading style={{ fontSize: '20px', marginBottom: '8px' }}>Content submission received</Heading>
          <Hr />
          <Text>
            <strong>{creatorName}</strong> has submitted content (Round {round}) for <strong>&quot;{dealTitle}&quot;</strong>. Review it in your agency portal.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
